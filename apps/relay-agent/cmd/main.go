package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/jellywrap/relay-agent/internal/api"
	"github.com/jellywrap/relay-agent/internal/relay"
	"github.com/jellywrap/relay-agent/internal/tunnel"
)

func main() {
	port := flag.Int("port", 8080, "API port")
	configPath := flag.String("config", "/etc/jellywrap/relay.json", "config file path")
	flag.Parse()

	cfg, err := relay.LoadConfig(*configPath)
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	tunnelMgr, err := tunnel.NewManager(cfg)
	if err != nil {
		log.Fatalf("tunnel: %v", err)
	}

	relaySvc, err := relay.New(cfg, tunnelMgr)
	if err != nil {
		log.Fatalf("relay: %v", err)
	}

	server := api.New(*port, relaySvc)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sigCh
		fmt.Println("\nshutting down...")
		cancel()
		relaySvc.Shutdown()
		tunnelMgr.Close()
		server.Shutdown(ctx)
	}()

	log.Printf("JellyWrap relay agent v0.1.0 on :%d", *port)
	if err := server.Start(); err != nil {
		log.Fatal(err)
	}
}
