# MicroForge Setup Guide

This comprehensive guide will help you set up the MicroForge microservices platform using 3 different deployment methods: **Application Specific** (for local development), **Docker Compose** (for local development) and **Kubernetes** (for production-ready deployment).

## 🎯 Overview

**MicroForge** is an enterprise-grade microservices platform consisting of:

- **Frontend Service** (React + Material-UI) - Port 3000
- **Auth Service** (Go) - Port 8082  
- **Login Service** (Java Spring Boot) - Port 8081
- **Metadata Service** (Python Flask) - Port 8084
- **Notification Service** (Node.js Express) - Port 8083
- **MySQL Databases** - Login DB (Port 3308), Notification DB (Port 3307)

---

## 📋 Prerequisites

### For Application Specific
```bash
# Frontend Servcie
- Node.js 18+ 
- npm 9+

# Verify installation
node --version
npm --version

# Login Service
- Java 21
- Maven 3.8+

# Verify installation
java -version
mvn --version

# Auth Service
- Go 1.21 or higher
- Make (optional)

# Verify installation
go version

# Local Development
- Node.js 18+
- npm 9+

# Verify installation
node --version
npm --version

# Metadata Service 
- Python 3.12+
- pip

# Verify installation
python --version
pip --version

```
### For Docker Compose Setup
```bash
# Required software
- Docker (>= 20.10)
- Docker Compose (>= 2.0)
- Git

# Verify installations
docker --version
docker-compose --version
git --version
```

### For Kubernetes Setup
```bash
# Required software
- Docker (>= 20.10)
- kubectl (>= 1.25)
- Kubernetes cluster (local: Docker Desktop, minikube, kind OR cloud: EKS, GKE, AKS)
- Helm (optional, for package management)

# Verify installations
kubectl version --client
kubectl cluster-info
```

### For AWS EKS Infrastructure (Optional)
```bash
# Required software
- Terraform (>= 1.0)
- AWS CLI (>= 2.0)
- kubectl

# AWS credentials configured
aws configure list
terraform --version
```

---
## 🚀 Method 1: Application Specific (Recommended for Development)
- Frontend Service - [Click Here](./src/frontend-service/README.md)
- Login Service - [Click Here](./src/login-service/README.md)
- Notification Service - [Click Here](./src/notification-service/README.md)
- Auth Service - [Click Here](./src/auth-service/README.md)
- Metadata Service - [Click Here](./src/metadata-service/README.md)
## 🚀 Method 2: Docker Compose Setup (Recommended for Development)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Manoj-14/MicroForge.git
cd MicroForge
```

### Step 2: Navigate to Source Directory
```bash
cd src
```

### Step 3: Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your preferred values
nano .env  # or use your preferred editor
```

**Required Environment Variables:**
```bash
# notification-service/.env
# Server Configuration
NOTIFICATION_SERVICE_PORT=8083
LOG_LEVEL=info

# CORS Configuration
CORS_ORIGIN=*

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=manumadhu1425@gmail.com
MAIL_PASSWORD=lpdfxgxkaegxrpkn
MAIL_FROM=noreply@microservices.com
MAIL_FROM_NAME=MicroForge

# Admin Configuration
ADMIN_EMAIL=admin@microservices.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

#mysql 
NOTIFICATION_SERVICE_DB_PORT=3306
NOTIFICATION_SERVICE_DB_USER=root
NOTIFICATION_SERVICE_DB_PASSWORD=root
NOTIFICATION_SERVICE_DB_DATABASE=empnotification

# auth-service/.env
AUTH_SERVICE_PORT=8082

# metadata-service/.env
FLASK_SECRET_KEY=f9731e7a0774ddebd70643e8c6046f4dc0ddf3eec637be8cb641f0e9d5e8dfd0
METADATA_SERVICE_PORT=8084

# frontend-service/.env
REACT_APP_LOGIN_SERVICE_URL=http://localhost:8081
REACT_APP_AUTH_SERVICE_URL=http://localhost:8082
REACT_APP_NOTIFICATION_SERVICE_URL=http://localhost:8083
REACT_APP_METADATA_SERVICE_URL=http://localhost:8084
REACT_APP_API_BASE_URL=http://localhost:3000  

#Login-service/.env
LOGIN_SERVICE_PORT=8081

LOGIN_SERVICE_DB_PORT=3306
LOGIN_SERVICE_DB_NAME=empdir
LOGIN_SERVICE_DB_PASSWORD=loginroot
# LOGIN_SERVICE_DB_URL=jdbc:mysql://${DB_HOST}:${DB_PORT:3306}/${DB_NAME}
LOGIN_SERVICE_DB_USERNAME=root
LOGIN_SERVICE_JWT_EXPIRATION_MS=86400000
LOGIN_SERVICE_JWT_SECRET=wybg9X4lzPycHWrvCBkPvssgGq3OowN2JWvQqOoe/g/u9wKiXXv71NAdngG83DFx
NOTIFICATION_SERVICE_URL=http://localhost:8083
```

### Step 4: Start All Services
```bash
# Start all services in detached mode
docker-compose up -d

# View logs for all services
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f frontend-service
```

### Step 5: Verify Deployment
```bash
# Check service status
docker-compose ps
```

### Step 6: Access the Application
- **Frontend Application**: http://localhost:3000
- **API Endpoints**: Available on respective service ports

### Docker Compose Management Commands
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete database data)
docker-compose down -v

# Rebuild and restart services
docker-compose down && docker-compose up -d --build

# View service logs
docker-compose logs [service-name]

```

---

## ☸️ Method 3: Kubernetes Setup (Production-Ready | Local)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Manoj-14/MicroForge.git
cd MicroForge
```

### Step 2: Verify Kubernetes Cluster
```bash
# Check cluster connection
kubectl cluster-info

# Verify nodes are ready
kubectl get nodes

# Check available namespaces
kubectl get namespaces
```

### Step 3: Deploy Infrastructure Components

#### Create Namespace
```bash
kubectl apply -f manifests/kubernetes/microforge.namespace.yaml

# Verify namespace creation
kubectl get namespaces | grep microforge

# Set microforge name space and default namespace
kubectl cofig set-context <current-context-name> --namespace=<namespace-name>
```

#### Deploy NGINX Ingress Controller
```bash
# Install NGINX Ingress Controller (if not already installed)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.13.2/deploy/static/provider/aws/deploy.yaml

```

#### Deploy Services
```bash
#can deploy all at once
kubectl apply -f /manifests/kubernets/
```



### Step 4: Verify Deployment
#### Use -n option only if you didn't set `microforge-dev-ns` namespace as default 
```bash
# Check all resources in microforge namespace
kubectl get all -n microforge-dev-ns

# Check pod status
kubectl get pods -n microforge-dev-ns

# Check services
kubectl get services -n microforge-dev-ns

# Check ingress
kubectl get ingress -n microforge-dev-ns

# Check logs for any service
kubectl logs -f deployment/auth-service -n microforge-dev-ns
```

### Step 5: Configure DNS (Production Only)
For production deployment, you'll need to:

1. **Update ingress hostnames** in `manifests/kubernetes/microforge.ingress.yaml`:
```yaml
rules:
- host: your-domain.com  # Replace with your domain
- host: api.your-domain.com  # Replace with your API subdomain
```

2. **Configure DNS records** pointing to your ingress controller's external IP:
```bash
# Get external IP
kubectl get service ingress-nginx-controller -n ingress-nginx
```

### Step 6: Access the Application
```bash
# For local development with port-forward
kubectl port-forward service/frontend-service 3000:80 -n microforge-dev-ns

# For production with proper DNS
Visit: https://your-domain.com
---

## 🏗️ Method 3: AWS EKS Infrastructure Provisioning (Advanced)

For production-grade AWS deployment with EKS, follow these steps:

### Step 1: Configure AWS Credentials
```bash
# Configure AWS CLI
aws configure

# Verify credentials
aws sts get-caller-identity
```

### Step 2: Prepare Terraform Configuration
```bash
cd infrastructure

# Copy and customize terraform variables
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
nano terraform.tfvars
```

**Required Terraform Variables:**
```hcl
# infrastructure/terraform.tfvars
project_name = "microforge"
aws_region = "ap-southeast-2"  # or your preferred region

vpc_cidr = {
  "stage" = "10.0.0.0/16"
  "production" = "10.1.0.0/16"
}

public_subnet_cidrs = {
  "stage" = ["10.0.1.0/24", "10.0.2.0/24"]
  "production" = ["10.1.1.0/24", "10.1.2.0/24"]
}

private_subnet_cidrs = {
  "stage" = ["10.0.10.0/24", "10.0.20.0/24"]  
  "production" = ["10.1.10.0/24", "10.1.20.0/24"]
}

cluster_name = "microforge-eks-cluster"
cluster_version = "1.28"

# Your existing AWS IAM user for cluster access
devops_username = "your-aws-username"
developer_username = "your-aws-username"

node_groups = {
  "stage" = {
    "worker-nodes" = {
      instance_types = ["t3.medium"]
      capacity_type = "ON_DEMAND"
      scaling_config = {
        desired_size = 2
        max_size     = 4
        min_size     = 1
      }
    }
  }
  "production" = {
    "worker-nodes" = {
      instance_types = ["t3.large"]
      capacity_type = "ON_DEMAND" 
      scaling_config = {
        desired_size = 3
        max_size     = 10
        min_size     = 2
      }
    }
  }
}
```

### Step 3: Initialize and Deploy Infrastructure
```bash
# Initialize Terraform
terraform init

# Create workspace for staging
terraform workspace new stage
terraform workspace select stage

# Plan the infrastructure
terraform plan

# Apply the configuration
terraform apply

# Configure kubectl for the new EKS cluster
aws eks update-kubeconfig --region ap-southeast-2 --name microforge-eks-cluster
```

### Step 4: Deploy Applications to EKS
```bash
# Return to project root
cd ..

# Deploy applications using the Kubernetes method above
kubectl apply -f manifests/kubernetes/
```
---

## 🔧 Configuration Management

### Environment-Specific Configurations

#### Docker Compose Environment Variables
Create separate `.env` files for different environments:

```bash
# .env.development
AUTH_SERVICE_PORT=8082
LOGIN_SERVICE_PORT=8081
# ... other development configs

# .env.production  
AUTH_SERVICE_PORT=8082
LOGIN_SERVICE_PORT=8081
# ... other production configs
```

#### Kubernetes Secrets
Can copy example secret files and replace with your values

---

## 📚 Additional Resources

### Container Images
All images are available on Docker Hub:
- `manojmdocker14/microforge-frontend-service:v1.1.0`
- `manojmdocker14/microforge-auth-service:v1.0.0`
- `manojmdocker14/microforge-login-service:v1.1.0`
- `manojmdocker14/microforge-metadata-service:v1.0.0`
- `manojmdocker14/microforge-notification-service:v1.0.0`

---

## 📞 Support and Contribution

### Getting Help
- **Issues**: Report bugs and issues on [GitHub Microforge Issues](https://github.com/Manoj-14/MicroForge/issues)

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`) 
5. Open a Pull Request with `stage` branch
6. Don't Open a Pull Request with `master` it will be rejected 

### Contact
- **Author**: Manoj M - DevOps Engineer & Full-Stack Developer
- **Email**: manojmanjunath1425@gmail.com
- **LinkedIn**: [Connect with me](https://linkedin.com/in/manoj-m)

---

**✅ You're now ready to run MicroForge! Choose the deployment method that best fits your needs and follow the step-by-step instructions above.**