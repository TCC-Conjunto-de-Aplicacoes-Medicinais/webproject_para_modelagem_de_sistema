# ============================================================
# ESTÁGIO 1: Build do Front-end (Next.js → Exportação Estática)
# ============================================================
FROM node:22-alpine AS frontend-builder

WORKDIR /app/front-end

# Copia apenas os arquivos de dependência primeiro (cache de camadas)
COPY front-end/package.json front-end/package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copia o restante do código do front-end
COPY front-end/ ./

# Executa o build estático (output: 'export' gera a pasta /out)
RUN npm run build

# ============================================================
# ESTÁGIO 2: Build do Back-end (Go → Binário estático)
# ============================================================
FROM golang:1.25-alpine AS backend-builder

RUN apk add --no-cache git ca-certificates

WORKDIR /app

# Copia go.mod e go.sum para cache de dependências
COPY back-end/go.mod back-end/go.sum ./
RUN go mod download

# Copia todo o código fonte do back-end
COPY back-end/ ./

# Compila o binário estático otimizado para Linux
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build \
    -ldflags="-w -s" \
    -o /app/server \
    ./cmd/api

# ============================================================
# ESTÁGIO 3: Imagem Final Mínima (Alpine ~5MB)
# ============================================================
FROM alpine:3.21

# Certificados TLS para chamadas HTTPS externas (S3, SMTP, etc.)
RUN apk add --no-cache ca-certificates tzdata \
    && cp /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime \
    && echo "America/Sao_Paulo" > /etc/timezone \
    && apk del tzdata

# Usuário não-root para segurança
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copia apenas o binário compilado do Go
COPY --from=backend-builder /app/server ./server

# Copia os arquivos estáticos gerados pelo Next.js
COPY --from=frontend-builder /app/front-end/out ./static

# Ajusta permissões
RUN chown -R appuser:appgroup /app

USER appuser

# A porta deve corresponder à variável PORT do .env
EXPOSE 8001

# Healthcheck para monitoramento
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8001/api/v1/health || exit 1

ENTRYPOINT ["./server"]
