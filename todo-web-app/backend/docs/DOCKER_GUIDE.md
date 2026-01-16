# Docker Guide for Backend Deployment

A complete guide to understanding and running your FastAPI backend with Docker.

---

## 📁 Where Are the Docker Files?

Your Docker configuration files are located in:

```
todo-web-app/backend/
├── Dockerfile.hf      # Production Dockerfile for Hugging Face (port 7860)
├── Dockerfile         # Development Dockerfile (port 8000)
├── .dockerignore      # Files excluded from Docker build
└── README_HF.md       # Hugging Face Space configuration
```

---

## 🤔 What is Docker?

**Docker Image** = A snapshot/template of your application with all dependencies
**Docker Container** = A running instance of that image

Think of it like:
- **Image** = A recipe/blueprint
- **Container** = The actual dish/building made from that recipe

When you ran `docker build`, you created an **image** called `todo-backend-hf`.
When you run `docker run`, you create a **container** from that image.

---

## 🛠️ Prerequisites

1. **Docker Desktop** - Already installed (you used it to build!)
2. **Your `.env` values** - You'll need these to run the container

---

## 🚀 Step-by-Step Local Testing Guide

### Step 1: Open Terminal in Backend Directory

```powershell
cd "d:\GIAIC\Quarter 4\Hackathon\Project 2\hackathon-todo\todo-web-app\backend"
```

### Step 2: Build the Docker Image (Already Done ✅)

If you need to rebuild (after code changes):

```powershell
docker build -f Dockerfile.hf -t todo-backend-hf .
```

### Step 3: Run the Container

**Option A: Using inline environment variables**

```powershell
docker run -p 7860:7860 `
  -e DATABASE_URL="postgresql+asyncpg://your-user:your-password@your-host/your-db?sslmode=require" `
  -e BETTER_AUTH_SECRET="your-secret-min-32-chars" `
  -e CORS_ORIGINS="http://localhost:3000" `
  todo-backend-hf
```

**Option B: Using your existing .env file (Recommended)**

```powershell
docker run -p 7860:7860 --env-file .env todo-backend-hf
```

> ⚠️ Note: The container runs on port **7860** (Hugging Face requirement), not 8000!

### Step 4: Test the Endpoints

Open these URLs in your browser or use curl:

| Endpoint | URL | Expected Result |
|----------|-----|-----------------|
| API Info | http://localhost:7860/ | JSON with API details |
| Health Check | http://localhost:7860/api/health | `{"status": "healthy", ...}` |
| Swagger Docs | http://localhost:7860/docs | Interactive API documentation |

### Step 5: Stop the Container

Press `Ctrl+C` in the terminal where the container is running.

Or find and stop it:

```powershell
# List running containers
docker ps

# Stop container by ID
docker stop <container-id>
```

---

## 🔧 Useful Docker Commands

```powershell
# List all images
docker images

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Remove the image (if you need to rebuild fresh)
docker rmi todo-backend-hf

# View container logs
docker logs <container-id>

# Run in detached mode (background)
docker run -d -p 7860:7860 --env-file .env todo-backend-hf

# Check image size
docker images todo-backend-hf
```

---

## 📋 Quick Copy-Paste Commands

**Build:**
```powershell
docker build -f Dockerfile.hf -t todo-backend-hf .
```

**Run with .env file:**
```powershell
docker run -p 7860:7860 --env-file .env todo-backend-hf
```

**Test health:**
```powershell
curl http://localhost:7860/api/health
```

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Stop other services using port 7860 |
| Database connection error | Verify DATABASE_URL in your .env |
| Container starts but exits | Check logs with `docker logs <id>` |
| Image not found | Rebuild with `docker build` command |

---

## 🌐 Next Steps: Deploy to Hugging Face

After testing locally, you're ready to deploy! When you provide the Hugging Face MCP, I'll help you:

1. Create a new Docker Space
2. Connect your GitHub repository
3. Configure environment secrets
4. Deploy and verify
