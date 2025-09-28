## 🔐 Auth Service (Go + Gin Framework)

### Overview
JWT authentication service built with Go and Gin framework, providing token validation and user authentication.

### Prerequisites
```bash
# Local Development
- Go 1.21 or higher
- Make (optional)

# Verify installation
go version
```

### Local Development Setup
```bash
# Navigate to auth service
cd src/auth-service

# Initialize Go modules (if needed)
go mod init auth-service
go mod tidy

# Copy environment configuration
cp .env.example .env

# Edit configuration
nano .env
```

**Required Environment Variables:**
```bash
# .env file for auth-service
AUTH_SERVICE_PORT=8082

```

### Build and Run Locally
```bash
# Install dependencies
go mod download

# Build the application
go build -o auth-service main.go

# Run directly
./auth-service

# OR run with go
go run main.go

# With custom port
AUTH_SERVICE_PORT=8083 go run main.go
```

### Docker Build
```bash
# Build Docker image locally
docker build -t microforge-auth-service:local .

# Run with Docker
docker run -p 8082:8082 \
  -e AUTH_SERVICE_PORT=8082 \
  microforge-auth-service:local
```
