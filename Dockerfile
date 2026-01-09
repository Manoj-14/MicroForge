# Dockerfile for MicroForge

# ==============================================================================
# Auth Service
# ==============================================================================
FROM golang:1.25.1-bookworm AS auth-service-builder

WORKDIR /usr/src/app

COPY ./src/auth-service/go.mod ./src/auth-service/go.sum ./
RUN go mod download

COPY ./src/auth-service/ ./

RUN CGO_ENABLED=0 GOOS=linux GO111MODULE=on go build -ldflags "-s -w" -o /auth-service main.go

FROM gcr.io/distroless/static-debian12:nonroot AS auth-service
WORKDIR /usr/src/app

COPY --from=auth-service-builder /auth-service ./

EXPOSE 8082

ENTRYPOINT [ "./auth-service" ]

# ==============================================================================
# Frontend Service
# ==============================================================================
FROM docker.io/library/node:22-slim AS frontend-service-builder

WORKDIR /app

COPY ./src/frontend-service/package.json ./src/frontend-service/package-lock.json ./
RUN npm ci

COPY ./src/frontend-service/src/ ./src/
COPY ./src/frontend-service/public/ ./public/

RUN npm run build

FROM nginx:alpine AS frontend-service
COPY --from=frontend-service-builder /app/build /usr/share/nginx/html
COPY ./src/frontend-service/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./src/frontend-service/config.template.json /usr/share/nginx/html/config.template.json
COPY ./src/frontend-service/frontendEntrypoint.sh /frontendEntrypoint.sh
RUN chmod +x /frontendEntrypoint.sh

EXPOSE 80
ENTRYPOINT [ "/frontendEntrypoint.sh" ]

# ==============================================================================
# Login Service
# ==============================================================================
FROM eclipse-temurin:21.0.5_11-jdk-jammy AS login-service-builder

WORKDIR /app

COPY ./src/login-service/mvnw ./src/login-service/.mvn ./
COPY ./src/login-service/pom.xml ./

RUN chmod +x mvnw && ./mvnw dependency:go-offline

COPY ./src/login-service/src ./src/

RUN ./mvnw clean package -DskipTests

FROM gcr.io/distroless/java21-debian12:latest AS login-service

WORKDIR /app

COPY --from=login-service-builder /app/target/login-service-1.0.0.jar login-service.jar

EXPOSE 8081

ENTRYPOINT [ "java" , "-jar", "login-service.jar" ]

# ==============================================================================
# Metadata Service
# ==============================================================================
FROM docker.io/library/python:3.12-alpine3.22 AS metadata-service-builder

RUN apk update && \
    apk add gcc g++ linux-headers

WORKDIR /app

COPY ./src/metadata-service/requirements.txt requirements.txt

RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install -r requirements.txt

FROM docker.io/library/python:3.12-alpine3.22 AS metadata-service

COPY --from=metadata-service-builder /opt/venv /opt/venv

WORKDIR /app

COPY ./src/metadata-service/ .

CMD ["/opt/venv/bin/gunicorn", "app:app", "--workers", "4", "--bind", "0.0.0.0:8084"]

# ==============================================================================
# Notification Service
# ==============================================================================
FROM node:18-alpine AS notification-service-builder
WORKDIR /app
COPY ./src/notification-service/package.json ./src/notification-service/package-lock.json ./
RUN npm ci

FROM gcr.io/distroless/nodejs18-debian11:nonroot AS notification-service
WORKDIR /app

COPY --from=notification-service-builder /app/node_modules ./node_modules
COPY ./src/notification-service/ .

CMD [ "app.js" ]
