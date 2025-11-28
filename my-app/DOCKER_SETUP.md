# Docker Setup Guide for GenprintAI

This guide will help you set up and run the GenprintAI application using Docker.

## Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)
- Git (to clone the repository)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/rayyanbey/GenprintAI.git
cd GenprintAI/my-app
```

### 2. Configure Environment Variables

Copy the example environment file and update it with your configuration:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

Edit the `.env` file and update the following variables:
- `POSTGRES_PASSWORD`: Set a strong password for your database
- `DB_URL`: Update with the same password you set above

### 3. Update Next.js Configuration

Add the following to `next.config.ts` to enable standalone output:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  /* other config options here */
};
```

### 4. Build and Run

Start all services with Docker Compose:

```bash
docker-compose up -d
```

This command will:
- Pull the PostgreSQL image
- Build the Next.js application image
- Start both containers
- Set up the network and volumes

### 5. Access the Application

- **Application**: http://localhost:3000
- **Database**: localhost:5432

## Docker Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Stop Services and Remove Volumes
```bash
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f db
```

### Rebuild Application
```bash
docker-compose up -d --build app
```

### Execute Commands in Container
```bash
# Access app container shell
docker-compose exec app sh

# Access database
docker-compose exec db psql -U postgres -d genprintai
```

## Project Structure

```
my-app/
├── Dockerfile              # Multi-stage Docker build configuration
├── docker-compose.yml      # Docker Compose orchestration
├── .dockerignore          # Files to exclude from Docker build
├── .env                   # Environment variables (create from .env.example)
├── .env.example           # Example environment variables
└── DOCKER_SETUP.md        # This file
```

## Configuration Details

### Dockerfile
The Dockerfile uses a multi-stage build:
1. **deps**: Installs dependencies
2. **builder**: Builds the Next.js application
3. **runner**: Creates the production runtime image

### docker-compose.yml
Defines two services:
- **db**: PostgreSQL 16 database with persistent storage
- **app**: Next.js application connected to the database

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database username | postgres |
| `POSTGRES_PASSWORD` | Database password | postgres |
| `POSTGRES_DB` | Database name | genprintai |
| `DB_PORT` | Database port | 5432 |
| `APP_PORT` | Application port | 3000 |
| `DB_URL` | Full database connection string | - |

## Troubleshooting

### Port Already in Use
If port 3000 or 5432 is already in use, change `APP_PORT` or `DB_PORT` in your `.env` file.

### Database Connection Issues
1. Check if the database is healthy:
   ```bash
   docker-compose ps
   ```
2. Verify the `DB_URL` in your `.env` file matches the database credentials

### Rebuild from Scratch
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Check Container Status
```bash
docker-compose ps
```

### View Container Resource Usage
```bash
docker stats
```

## Development vs Production

### Development Mode
For development, you may want to mount your code as a volume:

```yaml
# Add to app service in docker-compose.yml
volumes:
  - .:/app
  - /app/node_modules
  - /app/.next
```

Then update the command:
```yaml
command: npm run dev
```

### Production Mode
The current setup is optimized for production with:
- Multi-stage builds for smaller images
- Standalone Next.js output
- Non-root user for security
- Health checks
- Persistent volumes

## Cleanup

Remove all containers, networks, and volumes:
```bash
docker-compose down -v
docker system prune -a
```

## Support

For issues or questions, please create an issue on the GitHub repository.
