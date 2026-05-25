package relay

import (
	"encoding/json"
	"fmt"
	"os"
	"sync"
	"time"
)

type Config struct {
	ControlPlane string            `json:"control_plane"`
	ListenPort   int               `json:"listen_port"`
	ExternalIP   string            `json:"external_ip"`
	WGPort       int               `json:"wg_port"`
	WGInterface  string            `json:"wg_interface"`
	Subnet       string            `json:"subnet"`
	Peers        map[string]Peer   `json:"peers"`
	Tokens       map[string]string `json:"tokens"`
	MaxPeers     int               `json:"max_peers"`
}

type Peer struct {
	PublicKey  string `json:"public_key"`
	AllowedIPs string `json:"allowed_ips"`
	Endpoint   string `json:"endpoint,omitempty"`
	Name       string `json:"name"`
	CreatedAt  string `json:"created_at"`
	LastSeen   string `json:"last_seen,omitempty"`
	Traffic    int64  `json:"traffic"`
	Active     bool   `json:"active"`
}

func LoadConfig(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return &Config{
				ControlPlane: "https://api.jellywrap.net",
				ListenPort:   8080,
				WGPort:       51820,
				WGInterface:  "sv0",
				Subnet:       "10.77.0.0/24",
				Peers:        make(map[string]Peer),
				Tokens:       make(map[string]string),
				MaxPeers:     100,
			}, nil
		}
		return nil, fmt.Errorf("read config: %w", err)
	}
	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("parse config: %w", err)
	}
	if cfg.Peers == nil {
		cfg.Peers = make(map[string]Peer)
	}
	if cfg.Tokens == nil {
		cfg.Tokens = make(map[string]string)
	}
	return &cfg, nil
}

func (c *Config) Save(path string) error {
	data, err := json.MarshalIndent(c, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0600)
}

type Relay struct {
	cfg       *Config
	tunnel    TunnelManager
	mu        sync.RWMutex
	peers     map[string]Peer
	connected map[string]time.Time
	configPath string
}

type TunnelManager interface {
	Setup() error
	AddPeer(publicKey, allowedIPs string) error
	RemovePeer(publicKey string) error
	GetStats() (map[string]PeerStats, error)
	Close() error
}

type PeerStats struct {
	RxBytes    int64
	TxBytes    int64
	LastHandshake time.Time
}

func New(cfg *Config, tunnel TunnelManager) (*Relay, error) {
	r := &Relay{
		cfg:        cfg,
		tunnel:     tunnel,
		peers:      cfg.Peers,
		connected:  make(map[string]time.Time),
		configPath: "/etc/jellywrap/relay.json",
	}

	if err := tunnel.Setup(); err != nil {
		return nil, fmt.Errorf("tunnel setup: %w", err)
	}

	return r, nil
}

func (r *Relay) RegisterPeer(token, name, publicKey string) (*Peer, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	expectedToken, ok := r.cfg.Tokens[token]
	if !ok || expectedToken != token {
		return nil, fmt.Errorf("invalid token")
	}

	if len(r.peers) >= r.cfg.MaxPeers {
		return nil, fmt.Errorf("max peers reached (%d)", r.cfg.MaxPeers)
	}

	if _, exists := r.peers[publicKey]; exists {
		return nil, fmt.Errorf("peer already registered")
	}

	peerIdx := len(r.peers) + 2
	allowedIPs := fmt.Sprintf("%s/%d", nthIP(r.cfg.Subnet, peerIdx), 32)

	peer := Peer{
		PublicKey:  publicKey,
		AllowedIPs: allowedIPs,
		Name:       name,
		CreatedAt:  time.Now().UTC().Format(time.RFC3339),
		Active:     false,
	}

	if err := r.tunnel.AddPeer(publicKey, allowedIPs); err != nil {
		return nil, fmt.Errorf("add wireguard peer: %w", err)
	}

	r.peers[publicKey] = peer
	r.cfg.Peers = r.peers
	_ = r.cfg.Save(r.configPath)

	return &peer, nil
}

func (r *Relay) RemovePeer(publicKey string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.peers[publicKey]; !exists {
		return fmt.Errorf("peer not found")
	}

	if err := r.tunnel.RemovePeer(publicKey); err != nil {
		return fmt.Errorf("remove wireguard peer: %w", err)
	}

	delete(r.peers, publicKey)
	r.cfg.Peers = r.peers
	_ = r.cfg.Save(r.configPath)

	return nil
}

func (r *Relay) ListPeers() []Peer {
	r.mu.RLock()
	defer r.mu.RUnlock()

	stats, _ := r.tunnel.GetStats()

	peers := make([]Peer, 0, len(r.peers))
	for _, p := range r.peers {
		if s, ok := stats[p.PublicKey]; ok {
			p.Traffic = s.RxBytes + s.TxBytes
			p.Active = !s.LastHandshake.IsZero() && time.Since(s.LastHandshake) < 3*time.Minute
			p.LastSeen = s.LastHandshake.UTC().Format(time.RFC3339)
		}
		peers = append(peers, p)
	}
	return peers
}

func (r *Relay) GetRelayConfig(publicKey string) (*RelayConfig, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	peer, exists := r.peers[publicKey]
	if !exists {
		return nil, fmt.Errorf("peer not found")
	}

	return &RelayConfig{
		RelayEndpoint:  fmt.Sprintf("%s:%d", r.cfg.ExternalIP, r.cfg.WGPort),
		RelayPublicKey: r.cfg.WGInterface,
		AssignedIP:     peer.AllowedIPs,
		DNSServers:     []string{"1.1.1.1", "1.0.0.1"},
	}, nil
}

func (r *Relay) Shutdown() {
	r.mu.Lock()
	defer r.mu.Unlock()
}

type RelayConfig struct {
	RelayEndpoint  string   `json:"relay_endpoint"`
	RelayPublicKey string   `json:"relay_public_key"`
	AssignedIP     string   `json:"assigned_ip"`
	DNSServers     []string `json:"dns_servers"`
}

func nthIP(cidr string, n int) string {
	return fmt.Sprintf("10.77.0.%d", n)
}
