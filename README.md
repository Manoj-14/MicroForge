# 🚀 MicroForge

> **Enterprise-Grade Microservices Platform** | Showcasing Modern DevOps & Cloud-Native Architecture

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://hub.docker.com/u/manojmdocker14)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Native-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Go](https://img.shields.io/badge/Go-1.21-00ADD8?logo=go&logoColor=white)](https://golang.org/)
[![Java](https://img.shields.io/badge/Java-Spring_Boot_3-ED8B00?logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![Python](https://img.shields.io/badge/Python-Flask-3776AB?logo=python&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

**MicroForge** is a production-ready microservices platform demonstrating modern software architecture, DevOps engineering excellence, and cloud-native deployment strategies. Built with a polyglot approach across 5+ technologies, it showcases enterprise-level practices including containerization, orchestration, and comprehensive monitoring.

---

## 🎯 **What This Project Demonstrates**

✅ **Polyglot Microservices Architecture** - 5 services, 5 different technologies  
✅ **Production-Ready Containerization** - Multi-stage Docker builds, optimized images  
✅ **Kubernetes Native Deployment** - Complete manifests, ConfigMaps, Secrets  
✅ **Enterprise DevOps Practices** - CI/CD ready, health monitoring, logging  
✅ **Security-First Design** - JWT authentication, CORS, environment isolation  
✅ **Scalable Infrastructure** - Load balancing, service discovery, auto-scaling ready  

---

### **Core Services**

| Service | Technology | Purpose | Key Features |
|---------|------------|---------|--------------|
| **Frontend** | React 18 + Material-UI | User Interface | Runtime config injection, Responsive design |
| **Auth Service** | Go + Gin Framework | JWT Authentication | Token validation, CORS handling, Middleware |
| **Login Service** | Java Spring Boot 3 | User Management | JPA integration, Security, REST APIs |
| **Metadata Service** | Python Flask | System Monitoring | Cloud detection, Stress testing, Metrics |
| **Notification Service** | Node.js + Express | Event Processing | Async notifications, Email integration |

---

## 🛠️ Technology Stack

| Service | Technology | Port | Container Image |
|---------|------------|------|-----------------|
| **Frontend** | React + Nginx | 3000 | `manojmdocker14/microforge-frontend-service:v1.1.0` |
| **Auth** | Go + Gin | 8082 | `manojmdocker14/microforge-auth-service:v1.0.0` |
| **Login** | Java + Spring Boot | 8081 | `manojmdocker14/microforge-login-service:v1.1.0` |
| **Metadata** | Python + Flask | 8084 | `manojmdocker14/microforge-metadata-service:v1.0.0` |
| **Notification** | Node.js | 8083 | `manojmdocker14/microforge-notification-service:v1.0.0` |
| **Login DB** | MySQL 8.0 | 3308 | Custom with init scripts |
| **Notification DB** | MySQL 8.0 | 3307 | Custom with init scripts |

---
## 🚀 **Quick Start**

### **Option 1: Docker Compose (Fastest)**
```bash
git clone https://github.com/Manoj-14/MicroForge.git
cd MicroForge/src
docker-compose up -d
```
🎉 **Access**: http://localhost:3000

### **Option 2: Kubernetes (Production)**
```bash
# Deploy to Kubernetes cluster
kubectl apply -f manifests/kubernetes/
kubectl get pods -n microforge-dev-ns
```
🎉 **Access**: Configure ingress and DNS

---

## 💼 **Professional Features**

### **🔧 DevOps Excellence**
- **Multi-stage Docker builds** with production optimization
- **Kubernetes manifests** with best practices (ConfigMaps, Secrets, Health checks)
- **Environment configuration injection** - Same image, multiple environments
- **Comprehensive health monitoring** across all services
- **Structured logging** with centralized configuration

### **🛡️ Security & Production Readiness**
- **JWT-based authentication** with secure token handling
- **CORS configuration** for cross-origin security
- **Container security** with distroless base images
- **Network isolation** with proper Kubernetes networking
- **Secret management** with Kubernetes native secrets

### **📊 Monitoring & Observability**
- **Health check endpoints** for all services (`/api/health`, `/actuator/health`)
- **System metrics collection** (CPU, memory, network, disk usage)
- **Cloud environment detection** (AWS, Kubernetes, local)
- **Built-in stress testing** capabilities for performance validation

### **🌟 Advanced Capabilities**
- **Runtime configuration injection** - Deploy once, configure anywhere
- **Polyglot architecture** - Best tool for each job
- **Database integration** with connection pooling and transactions
- **API-first design** with comprehensive REST endpoints
- **Scalable architecture** ready for horizontal scaling

---

## 🛠️ **Technology Stack**

<table>
<tr>
<td><strong>Frontend</strong></td>
<td>React 18, Material-UI, Axios, React Router</td>
</tr>
<tr>
<td><strong>Backend</strong></td>
<td>Go (Gin), Java (Spring Boot), Python (Flask), Node.js (Express)</td>
</tr>
<tr>
<td><strong>Databases</strong></td>
<td>MySQL 8.0 with connection pooling</td>
</tr>
<tr>
<td><strong>Infrastructure</strong></td>
<td>Docker, Kubernetes, Nginx Ingress</td>
</tr>
<tr>
<td><strong>DevOps</strong></td>
<td>Docker Hub, K8s manifests, Environment injection</td>
</tr>
<tr>
<td><strong>Monitoring</strong></td>
<td>Health checks, Metrics collection, Stress testing</td>
</tr>
</table>

---

## 📈 **Key Metrics & Achievements**

🎯 **5 Microservices** deployed across different technology stacks  
🐳 **Production-optimized Docker images** with multi-stage builds  
☸️ **Complete Kubernetes deployment** with 20+ manifest files  
🔧 **Zero-rebuild deployments** with runtime configuration  
📊 **Comprehensive monitoring** with health checks and metrics  
🛡️ **Security-first** approach with JWT and proper CORS  

---

## 🚀 **API Endpoints**

### **Authentication Service (Go - Port 8082)**
```http
GET  /api/health              # Health check
POST /api/validate            # JWT token validation
GET  /api/verify/:token       # Token verification
GET  /api/protected/profile   # Protected user profile
```

### **Login Service (Java - Port 8081)**
```http
GET  /actuator/health         # Spring Boot health check
POST /api/auth/login          # User authentication
POST /api/auth/register       # User registration
GET  /api/users               # User management
```

### **Metadata Service (Python - Port 8084)**
```http
GET  /api/health              # Health check
GET  /api/metadata/instance   # System instance metadata
GET  /api/metadata/deployment # Deployment information
POST /api/stress/start        # Performance stress testing
```

### **Notification Service (Node.js - Port 8083)**
```http
GET  /actuator/health         # Health check
POST /api/notifications       # Send notifications
GET  /api/notifications       # List notifications
POST /api/notifications/email # Email notifications
```

---

## 🔧 **Development Highlights**

### **Enterprise Patterns Implemented**
- **API Gateway Pattern** with Nginx Ingress
- **Service Discovery** with Kubernetes DNS
- **Configuration Management** with ConfigMaps and Secrets
- **Health Check Pattern** across all services
- **Circuit Breaker Ready** architecture
- **Database Per Service** pattern

### **Production Deployment Strategy**
- **Blue-Green Ready** with Kubernetes deployments (Yet to Configure)
- **Rolling Updates** with zero-downtime deployments 
- **Horizontal Pod Autoscaling** ready infrastructure (Yet to Configure)
- **Multi-environment Support** (dev, staging, production)
- **Container Registry Integration** with Docker Hub

---

## 📚 **Documentation & Setup**

### **Repository Structure**
```
MicroForge/
├── src/                     # Source code for all services
│   ├── frontend-service/    # React application
│   ├── auth-service/        # Go authentication service
│   ├── login-service/       # Java Spring Boot service
│   ├── metadata-service/    # Python Flask service
│   ├── notification-service/# Node.js service
│   └── docker-compose.yml   # Local development setup
├── manifests/kubernetes/    # K8s deployment manifests
└── README.md                # Project documentation
```

### **Environment Setup**
```bash
# Prerequisites
- Docker & Docker Compose
- Kubernetes cluster (local or cloud)
- kubectl configured

# Quick Development Setup
git clone https://github.com/Manoj-14/MicroForge.git
cd MicroForge/src
docker-compose up
```

---

## 🎖️ **Professional Achievements Demonstrated**

✅ **Full-Stack Development** across 5+ programming languages  
✅ **Cloud-Native Architecture** with Kubernetes expertise  
✅ **DevOps Engineering** with container orchestration  
✅ **Database Design** with proper normalization and relationships  
✅ **Security Implementation** with modern authentication patterns  
✅ **API Design** following REST principles and best practices  
✅ **Infrastructure as Code** with declarative Kubernetes manifests  
✅ **Production Readiness** with monitoring, logging, and health checks  

---

## 🤝 **Connect & Collaborate**

**Built by**: Manoj M - DevOps Engineer & Full-Stack Developer  
**LinkedIn**: [Connect with me](www.linkedin.com/in/manojm1425)  
**Email**: [manojmanjunathhs@gmail.com](mailto:manojmanjunathhs@gmail.com)  
**Hashnode**: [Read my blogs](https://hashnode.com/@manoj-m)
---

<div align="center">

### 🎯 Ready for Production | 🚀 Scalable Architecture | 🛡️ Security First

**Demonstrating Modern Software Engineering Excellence**

</div>