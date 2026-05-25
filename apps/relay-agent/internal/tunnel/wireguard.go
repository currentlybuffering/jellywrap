package tunnel

import (
	"fmt"
	"net"
	"os/exec"
	"strings"

	"github.com/jellywrap/relay-agent/internal/relay"
)

type Manager struct {
	iface    string
	port     int
	subnet   string
	extIP    string
	privKey  string
	pubKey   string
}

func NewManager(cfg *relay.Config) (*Manager, error) {
	privKey, pubKey, err := generateKeyPair()
	if err != nil {
		return nil, fmt.Errorf("generate keys: %w", err)
	}

	return &Manager{
		iface:   cfg.WGInterface,
		port:    cfg.WGPort,
		subnet:  cfg.Subnet,
		extIP:   cfg.ExternalIP,
		privKey: privKey,
		pubKey:  pubKey,
	}, nil
}

func (m *Manager) Setup() error {
	_, err := exec.LookPath("wg")
	if err != nil {
		return fmt.Errorf("wireguard (wg) not found: %w — install with: apt install wireguard", err)
	}

	linkAddr := strings.ReplaceAll(m.subnet, "0/24", "1/24")

	commands := [][]string{
		{"ip", "link", "add", m.iface, "type", "wireguard"},
		{"ip", "address", "add", linkAddr, "dev", m.iface},
		{"ip", "link", "set", m.iface, "up"},
	}

	for _, args := range commands {
		cmd := exec.Command(args[0], args[1:]...)
		if out, err := cmd.CombinedOutput(); err != nil {
			if !strings.Contains(string(out), "already exists") && !strings.Contains(string(out), "File exists") {
				return fmt.Errorf("%s: %s: %w", strings.Join(args, " "), string(out), err)
			}
		}
	}

	wgCmd := exec.Command("wg", "set", m.iface,
		"private-key", "/dev/stdin",
		"listen-port", fmt.Sprintf("%d", m.port),
	)
	stdin, err := wgCmd.StdinPipe()
	if err != nil {
		return err
	}
	go func() {
		stdin.Write([]byte(m.privKey))
		stdin.Close()
	}()
	if out, err := wgCmd.CombinedOutput(); err != nil {
		return fmt.Errorf("wg set: %s: %w", string(out), err)
	}

	_, cidr, _ := net.ParseCIDR(m.subnet)
	ones, _ := cidr.Mask.Size()
	routeCmd := exec.Command("ip", "route", "add", m.subnet, "dev", m.iface)
	if out, err := routeCmd.CombinedOutput(); err != nil {
		if !strings.Contains(string(out), "File exists") {
			_ = ones
			return fmt.Errorf("route add: %s: %w", string(out), err)
		}
	}

	return nil
}

func (m *Manager) AddPeer(publicKey, allowedIPs string) error {
	cmd := exec.Command("wg", "set", m.iface,
		"peer", publicKey,
		"allowed-ips", allowedIPs,
	)
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("wg set peer: %s: %w", string(out), err)
	}
	return nil
}

func (m *Manager) RemovePeer(publicKey string) error {
	cmd := exec.Command("wg", "set", m.iface,
		"peer", publicKey,
		"remove",
	)
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("wg remove peer: %s: %w", string(out), err)
	}
	return nil
}

func (m *Manager) GetStats() (map[string]relay.PeerStats, error) {
	cmd := exec.Command("wg", "show", m.iface, "dump")
	out, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	stats := make(map[string]relay.PeerStats)
	lines := strings.Split(string(out), "\n")
	for i, line := range lines {
		if i == 0 {
			continue
		}
		fields := strings.Split(line, "\t")
		if len(fields) < 8 {
			continue
		}

		var rx, tx int64
		fmt.Sscanf(fields[5], "%d", &rx)
		fmt.Sscanf(fields[6], "%d", &tx)

		stats[fields[0]] = relay.PeerStats{
			RxBytes: rx,
			TxBytes: tx,
		}
	}

	return stats, nil
}

func (m *Manager) Close() error {
	cmd := exec.Command("ip", "link", "del", m.iface)
	_ = cmd.Run()
	return nil
}

func (m *Manager) PublicKey() string {
	return m.pubKey
}

func generateKeyPair() (string, string, error) {
	privCmd := exec.Command("wg", "genkey")
	privOut, err := privCmd.Output()
	if err != nil {
		return "", "", err
	}
	privKey := strings.TrimSpace(string(privOut))

	pubCmd := exec.Command("wg", "pubkey")
	stdin, _ := pubCmd.StdinPipe()
	go func() {
		stdin.Write([]byte(privKey))
		stdin.Close()
	}()
	pubOut, err := pubCmd.Output()
	if err != nil {
		return "", "", err
	}
	pubKey := strings.TrimSpace(string(pubOut))

	return privKey, pubKey, nil
}
