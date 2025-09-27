## ☕ Login Service (Java Spring Boot)

### Overview
User authentication and management service built with Java 21 and Spring Boot 3.2.0, providing JWT token generation and user CRUD operations.

### Prerequisites
```bash
# Local Development
- Java 21
- Maven 3.8+

# Verify installation
java -version
mvn --version
```

### Database Setup
```bash
# Start MySQL database first
docker run -d \
  --name login-mysql \
  -p 3308:3306 \
  -e MYSQL_ROOT_PASSWORD=securepassword123 \
  -e MYSQL_DATABASE=empdir \
  manojmdocker14/microforge-users-mysql:v1.0.0
```

### Local Development Setup
```bash
# Navigate to login service
cd src/login-service

# Copy environment configuration
cp .env.example .env

# Edit configuration
nano .env
```

**Required Environment Variables:**
```bash
# .env file for login-service
LOGIN_SERVICE_PORT=8081
DB_HOST=localhost                     # or login-mysql for Docker
DB_PORT=3308                         # 3306 for direct MySQL connection
DB_NAME=empdir
DB_USERNAME=root
DB_PASSWORD=securepassword123
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION_MS=86400000           # 24 hours
NOTIFICATION_SERVICE_URL=http://localhost:8083

# Spring Boot profiles
SPRING_PROFILES_ACTIVE=dev
SPRING_JPA_HIBERNATE_DDL_AUTO=update
LOGGING_LEVEL_ROOT=INFO
```

### Build and Run Locally
```bash
# Clean and compile
./mvnw clean compile

# Run tests
./mvnw test

# Package application
./mvnw clean package -DskipTests

# Run the application
./mvnw spring-boot:run

# OR run the JAR directly
java -jar target/login-service-1.0.0.jar

# With custom configuration
java -jar target/login-service-1.0.0.jar --spring.profiles.active=dev --server.port=8081
```

### Docker Build
```bash
# Build Docker image locally
docker build -t microforge-login-service:local .

# Run with Docker
docker run -p 8081:8081 \
  -e LOGIN_SERVICE_PORT=8081 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=3308 \
  -e DB_NAME=empdir \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=securepassword123 \
  -e JWT_SECRET=your-secret-key \
  microforge-login-service:local
```
### Database Schema
- For data base schema or sql use files present in [mysql/empdir_users.sql](../mysql/empdir_users.sql)
---