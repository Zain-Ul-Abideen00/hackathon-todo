# Quickstart: Production Containerization

Build and run production Docker images for the Todo Web App.

## Prerequisites

- Docker Desktop or Docker Engine installed
- Access to the `todo-web-app/` directory

## Build Images

### Backend

```bash
cd todo-web-app/backend
docker build -t todo-backend .
```

Expected output: Build completes with `Successfully tagged todo-backend:latest`

### Frontend

```bash
cd todo-web-app/frontend
docker build -t todo-frontend .
```

Expected output: Build completes with `Successfully tagged todo-frontend:latest`

## Verify Image Sizes

```bash
docker images | grep todo
```

Verified Results (2026-01-31):
- `todo-backend`: 440MB
- `todo-frontend`: 300MB

> [!NOTE]
> Sizes are larger than target due to dependencies. Python slim base (120MB) + 88 packages, Node alpine + 596 packages.

## Run Containers

### Backend (requires environment variables)

```bash
docker run -d -p 8000:8000 --name todo-backend \
  -e DATABASE_URL="your-neon-connection-string" \
  -e BETTER_AUTH_SECRET="your-32-char-secret" \
  -e GEMINI_API_KEY="your-gemini-key" \
  -e CORS_ORIGINS="http://localhost:3000" \
  todo-backend
```

Test: `curl http://localhost:8000/api/health`

### Frontend

```bash
docker run -d -p 3000:3000 --name todo-frontend \
  -e NEXT_PUBLIC_API_URL="http://localhost:8000" \
  todo-frontend
```

Test: Open http://localhost:3000 in browser

## Cleanup

```bash
docker stop todo-backend todo-frontend
docker rm todo-backend todo-frontend
```

## Troubleshooting

### Build Fails
- Check Docker is running: `docker info`
- Check available disk space: `docker system df`

### Container Won't Start
- Check logs: `docker logs todo-backend`
- Verify environment variables are set

### Health Check Fails
- Ensure backend has `/api/health` endpoint
- Check database connectivity if degraded status
