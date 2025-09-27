## ⚛️ Frontend Service (React + Material-UI)

### Overview
React 18 application with Material-UI components, providing the user interface for the microservices platform.

### Prerequisites
```bash
# Local Development
- Node.js 18+ 
- npm 9+

# Verify installation
node --version
npm --version
```

### Local Development Setup
```bash
# Navigate to frontend service
cd src/frontend-service

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit configuration
nano .env
```

**Required Environment Variables:**
```bash
# .env file for frontend-service
REACT_APP_LOGIN_SERVICE_URL=http://localhost:8081
REACT_APP_AUTH_SERVICE_URL=http://localhost:8082
REACT_APP_NOTIFICATION_SERVICE_URL=http://localhost:8083
REACT_APP_METADATA_SERVICE_URL=http://localhost:8084
REACT_APP_API_BASE_URL=http://localhost:3000

# Optional: Development settings
GENERATE_SOURCEMAP=true
REACT_APP_ENV=development
```

### Build and Run Locally
```bash
# Start development server with hot reload
npm start
# Runs on http://localhost:3000

# Build for production
npm run build

# Serve production build locally (requires serve package)
npm install -g serve
serve -s build -l 3000
```

### Docker Build
```bash
# Build Docker image locally
docker build -t microforge-frontend-service:local .

# Run with Docker
docker run -p 3000:80 \
  -e REACT_APP_LOGIN_SERVICE_URL=http://localhost:8081 \
  -e REACT_APP_AUTH_SERVICE_URL=http://localhost:8082 \
  microforge-frontend-service:local
```

### Runtime Configuration
The frontend service supports runtime configuration injection:

```bash
# config.template.json (gets processed at runtime)
{
  "loginServiceUrl": "$REACT_APP_LOGIN_SERVICE_URL",
  "authServiceUrl": "$REACT_APP_AUTH_SERVICE_URL",
  "notificationServiceUrl": "$REACT_APP_NOTIFICATION_SERVICE_URL",
  "metadataServiceUrl": "$REACT_APP_METADATA_SERVICE_URL"
}
```

### Development Workflow
```bash
# Start all backend services first
cd ../
docker-compose up -d auth-service login-service metadata-service notification-service

# Then start frontend in development mode
cd frontend-service
npm start

# Access application at http://localhost:3000
```