FROM golang:1.24-alpine AS builder
RUN apk add --no-cache wireguard-tools
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /relay-agent ./cmd

FROM alpine:3.21
RUN apk add --no-cache wireguard-tools iproute2 ca-certificates
COPY --from=builder /relay-agent /usr/local/bin/relay-agent
RUN mkdir -p /etc/jellywrap
EXPOSE 8080 51820/udp
ENTRYPOINT ["relay-agent"]
