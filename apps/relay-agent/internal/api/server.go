package api

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/jellywrap/relay-agent/internal/relay"
)

type Server struct {
	e     *echo.Echo
	relay *relay.Relay
	port  int
}

func New(port int, r *relay.Relay) *Server {
	e := echo.New()
	e.HideBanner = true
	e.HidePort = true

	s := &Server{e: e, relay: r, port: port}

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodDelete},
	}))

	e.GET("/health", s.health)
	e.GET("/v1/peers", s.listPeers)
	e.POST("/v1/peers", s.registerPeer)
	e.DELETE("/v1/peers/:pubkey", s.removePeer)
	e.GET("/v1/peers/:pubkey/config", s.getPeerConfig)

	return s
}

func (s *Server) Start() error {
	return s.e.Start(fmt.Sprintf(":%d", s.port))
}

func (s *Server) Shutdown(ctx context.Context) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	s.e.Shutdown(ctx)
}

func (s *Server) health(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"status":  "ok",
		"version": "0.1.0",
	})
}

func (s *Server) listPeers(c echo.Context) error {
	peers := s.relay.ListPeers()
	return c.JSON(http.StatusOK, map[string]any{
		"peers": peers,
		"count": len(peers),
	})
}

type registerPeerReq struct {
	Token     string `json:"token"`
	Name      string `json:"name"`
	PublicKey string `json:"public_key"`
}

func (s *Server) registerPeer(c echo.Context) error {
	var req registerPeerReq
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}
	if req.Token == "" || req.PublicKey == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "token and public_key required"})
	}

	peer, err := s.relay.RegisterPeer(req.Token, req.Name, req.PublicKey)
	if err != nil {
		return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, peer)
}

func (s *Server) removePeer(c echo.Context) error {
	pubkey := c.Param("pubkey")
	if err := s.relay.RemovePeer(pubkey); err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "removed"})
}

func (s *Server) getPeerConfig(c echo.Context) error {
	pubkey := c.Param("pubkey")
	config, err := s.relay.GetRelayConfig(pubkey)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, config)
}
