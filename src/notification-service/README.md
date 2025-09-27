## 📨 Notification Service (Node.js Express)

### Overview
Asynchronous notification processing service built with Node.js and Express, providing email notifications, event processing, and notification management.

### Prerequisites
```bash
# Local Development
- Node.js 18+
- npm 9+

# Verify installation
node --version
npm --version
```

### Database Setup
```bash
# Start MySQL database first
docker run -d \
  --name notification-mysql \
  -p 3307:3306 \
  -e MYSQL_ROOT_PASSWORD=securepassword123 \
  -e MYSQL_DATABASE=empnotification \
  manojmdocker14/microforge-notifications-mysql:v1.0.0
```

### Local Development Setup
```bash
# Navigate to notification service
cd src/notification-service

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit configuration
nano .env
```

**Required Environment Variables:**
```bash
# .env file for notification-service
NOTIFICATION_SERVICE_PORT=8083
NODE_ENV=development                  # or 'production'
LOG_LEVEL=info

# Database configuration
MYSQL_HOST=localhost                  # or notification-mysql for Docker
MYSQL_PORT=3307                      # 3306 for direct MySQL connection
MYSQL_USER=root
MYSQL_PASSWORD=securepassword123
MYSQL_DATABASE=empnotification

# Email configuration (optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@microservices.com
MAIL_FROM_NAME=MicroForge

# CORS configuration
CORS_ORIGIN=*

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Admin configuration
ADMIN_EMAIL=admin@microservices.com
```

### Build and Run Locally
```bash
# Install dependencies
npm install

# Run in development mode with nodemon
npm run dev

# Run in production mode
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Docker Build
```bash
# Build Docker image locally
docker build -t microforge-notification-service:local .

# Run with Docker
docker run -p 8083:8083 \
  -e NOTIFICATION_SERVICE_PORT=8083 \
  -e MYSQL_HOST=host.docker.internal \
  -e MYSQL_PORT=3307 \
  -e MYSQL_USER=root \
  -e MYSQL_PASSWORD=securepassword123 \
  -e MYSQL_DATABASE=empnotification \
  microforge-notification-service:local
```

### Database Schema
- For data base schema or sql use files present in [mysql/empnotification_notifications.sql](../mysql/empnotification_notifications.sql)
---
---
