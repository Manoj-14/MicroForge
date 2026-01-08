# MicroForge Helm Chart - Quick Start Guide

This guide will help you quickly deploy MicroForge using Helm.

## Prerequisites

Ensure you have the following installed:
- Kubernetes cluster (Docker Desktop, Minikube, or cloud provider)
- kubectl configured
- Helm 3.0+

## Quick Installation Steps

### 1. Verify Prerequisites

```bash
# Check Kubernetes cluster
kubectl cluster-info

# Check Helm version
helm version

# Check if kubectl can access the cluster
kubectl get nodes
```

### 2. Navigate to Helm Chart Directory

```bash
cd manifests/helm
```

### 3. Install the Chart

For development/local environment:

```bash
helm install microforge ./microforge
```

For staging environment:

```bash
helm install microforge ./microforge -f ./microforge/values-staging.yaml
```

For production environment:

```bash
helm install microforge ./microforge -f ./microforge/values-production.yaml
```

### 4. Verify Installation

```bash
# Check all resources
kubectl get all -n microforge-dev-ns

# Check pods status (wait for all pods to be Running)
kubectl get pods -n microforge-dev-ns -w
```

### 5. Access the Application

#### Option A: Using Port-Forward (Recommended for Local)

```bash
# Forward frontend service
kubectl port-forward service/frontend-service 3000:80 -n microforge-dev-ns
```

Open browser: http://localhost:3000

#### Option B: Using Ingress (Recommended for Production)

Add to your hosts file (`/etc/hosts` on Linux/Mac or `C:\Windows\System32\drivers\etc\hosts` on Windows):

```
127.0.0.1  microforge.local
127.0.0.1  api.microforge.local
```

Access: http://microforge.local

## Testing Individual Services

```bash
# Port forward individual services
kubectl port-forward service/auth-service 8082:8082 -n microforge-dev-ns
kubectl port-forward service/login-service 8081:8081 -n microforge-dev-ns
kubectl port-forward service/notification-service 8083:8083 -n microforge-dev-ns
kubectl port-forward service/metadata-service 8084:8084 -n microforge-dev-ns

# Test health endpoints
curl http://localhost:8082/api/health
curl http://localhost:8081/actuator/health
curl http://localhost:8083/actuator/health
curl http://localhost:8084/api/health
```

## Common Operations

### View Logs

```bash
# View frontend logs
kubectl logs -f deployment/frontend-service -n microforge-dev-ns

# View auth service logs
kubectl logs -f deployment/auth-service -n microforge-dev-ns

# View all pods logs
kubectl logs -f -l app.kubernetes.io/name=microforge -n microforge-dev-ns
```

### Scale Services

```bash
# Scale frontend to 3 replicas
kubectl scale deployment frontend-service --replicas=3 -n microforge-dev-ns

# Or use Helm upgrade
helm upgrade microforge ./microforge --set frontendService.replicaCount=3
```

### Update Configuration

```bash
# Upgrade with new values
helm upgrade microforge ./microforge -f custom-values.yaml

# Upgrade specific parameter
helm upgrade microforge ./microforge --set authService.image.tag=v2.0.0
```

### Uninstall

```bash
# Remove the release
helm uninstall microforge

# Delete namespace (if needed)
kubectl delete namespace microforge-dev-ns
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n microforge-dev-ns

# Describe problem pod
kubectl describe pod <pod-name> -n microforge-dev-ns

# View logs
kubectl logs <pod-name> -n microforge-dev-ns
```

### Database Connection Issues

```bash
# Check MySQL pods
kubectl get pods -l app=login-mysql -n microforge-dev-ns
kubectl get pods -l app=notification-mysql -n microforge-dev-ns

# View MySQL logs
kubectl logs deployment/login-mysql -n microforge-dev-ns
```

### Ingress Not Working

```bash
# Check if NGINX Ingress Controller is installed
kubectl get pods -n ingress-nginx

# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.13.2/deploy/static/provider/cloud/deploy.yaml

# Check ingress resource
kubectl get ingress -n microforge-dev-ns
kubectl describe ingress -n microforge-dev-ns
```

## Customization Examples

### Custom Values File

Create a file named `my-values.yaml`:

```yaml
frontendService:
  replicaCount: 2

authService:
  replicaCount: 2

ingress:
  hosts:
    main: myapp.local
    api: api.myapp.local
```

Install with custom values:

```bash
helm install microforge ./microforge -f my-values.yaml
```

### Using Existing Database

```yaml
# Disable internal MySQL
loginMysql:
  enabled: false

notificationMysql:
  enabled: false

# Update service configurations
loginService:
  config:
    # Use external database hostname
  secrets:
    dbUsername: external-db-user
    dbPassword: external-db-password
```

## Next Steps

- Review the full [README.md](README.md) for detailed configuration options
- Check [values.yaml](values.yaml) for all available parameters
- Review production best practices in [values-production.yaml](values-production.yaml)
- Set up monitoring and logging
- Configure CI/CD pipelines

## Support

For issues or questions:
- GitHub: https://github.com/Manoj-14/MicroForge
- Email: manojmanjunathhs@gmail.com

