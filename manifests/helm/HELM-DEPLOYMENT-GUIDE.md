# MicroForge Helm Deployment Guide

This guide provides step-by-step instructions for deploying MicroForge using the newly created Helm charts.

## What Was Created

A complete Helm chart for MicroForge has been created in the `manifests/helm/microforge/` directory with the following structure:

```
manifests/helm/
├── README.md                           # Helm directory overview
├── HELM-CHART-SUMMARY.md              # Implementation summary
└── microforge/                         # Main Helm chart
    ├── Chart.yaml                      # Chart metadata
    ├── values.yaml                     # Default values
    ├── values-staging.yaml             # Staging environment values
    ├── values-production.yaml          # Production environment values
    ├── .helmignore                     # Ignore patterns
    ├── README.md                       # Complete chart documentation
    ├── QUICKSTART.md                   # Quick start guide
    ├── TESTING.md                      # Testing procedures
    ├── test-chart.sh                   # Automated test script
    └── templates/                      # Kubernetes resource templates
        ├── NOTES.txt                   # Post-install instructions
        ├── _helpers.tpl                # Template helpers
        ├── namespace.yaml              # Namespace
        ├── ingress.yaml                # Ingress configuration
        ├── auth-service-*              # Auth service resources
        ├── login-service-*             # Login service resources
        ├── metadata-service-*          # Metadata service resources
        ├── notification-service-*      # Notification service resources
        ├── frontend-service-*          # Frontend service resources
        ├── login-mysql-*              # Login MySQL resources
        └── notification-mysql-*       # Notification MySQL resources
```

## Prerequisites

Before deploying, ensure you have:

1. Kubernetes cluster running (Docker Desktop, Minikube, or cloud provider)
2. kubectl installed and configured
3. Helm 3.0+ installed
4. NGINX Ingress Controller (optional, for ingress support)

### Install Helm (if not already installed)

**Windows:**
```powershell
choco install kubernetes-helm
# or
winget install Helm.Helm
```

**Linux:**
```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

**macOS:**
```bash
brew install helm
```

### Verify Installation

```bash
helm version
kubectl version --client
kubectl cluster-info
```

## Deployment Options

### Option 1: Quick Deployment (Development)

For local development with default settings:

```bash
# Navigate to the helm directory
cd manifests/helm

# Install the chart
helm install microforge ./microforge

# Wait for pods to be ready
kubectl get pods -n microforge-dev-ns -w
```

Access the application:
```bash
# Port forward the frontend
kubectl port-forward service/frontend-service 3000:80 -n microforge-dev-ns
```

Open browser: http://localhost:3000

### Option 2: Staging Deployment

For staging environment with moderate resources:

```bash
cd manifests/helm

# Install with staging values
helm install microforge ./microforge \
  -f ./microforge/values-staging.yaml \
  --namespace microforge-staging-ns \
  --create-namespace
```

### Option 3: Production Deployment

For production with high availability:

1. First, update production secrets in `values-production.yaml`:
```yaml
loginService:
  secrets:
    dbUsername: produser
    dbPassword: YOUR_SECURE_PASSWORD_HERE
    jwtSecret: YOUR_SECURE_JWT_SECRET_HERE
```

2. Deploy:
```bash
cd manifests/helm

# Install with production values
helm install microforge ./microforge \
  -f ./microforge/values-production.yaml \
  --namespace microforge-prod-ns \
  --create-namespace
```

### Option 4: Custom Configuration

Create your own values file:

```bash
# Create custom values file
cat > my-values.yaml <<EOF
frontendService:
  replicaCount: 3

authService:
  replicaCount: 2

ingress:
  hosts:
    main: myapp.example.com
    api: api.myapp.example.com
EOF

# Install with custom values
helm install microforge ./microforge -f my-values.yaml
```

## Verification

### Check Deployment Status

```bash
# Check Helm release
helm status microforge -n microforge-dev-ns

# Check all resources
kubectl get all -n microforge-dev-ns

# Check pods
kubectl get pods -n microforge-dev-ns

# Check services
kubectl get services -n microforge-dev-ns

# Check ingress
kubectl get ingress -n microforge-dev-ns
```

### View Logs

```bash
# Frontend service
kubectl logs -f deployment/frontend-service -n microforge-dev-ns

# Auth service
kubectl logs -f deployment/auth-service -n microforge-dev-ns

# Login service
kubectl logs -f deployment/login-service -n microforge-dev-ns

# Notification service
kubectl logs -f deployment/notification-service -n microforge-dev-ns

# Metadata service
kubectl logs -f deployment/metadata-service -n microforge-dev-ns
```

### Test Health Endpoints

```bash
# Port forward each service and test
kubectl port-forward service/auth-service 8082:8082 -n microforge-dev-ns &
curl http://localhost:8082/api/health

kubectl port-forward service/login-service 8081:8081 -n microforge-dev-ns &
curl http://localhost:8081/actuator/health

kubectl port-forward service/notification-service 8083:8083 -n microforge-dev-ns &
curl http://localhost:8083/actuator/health

kubectl port-forward service/metadata-service 8084:8084 -n microforge-dev-ns &
curl http://localhost:8084/api/health
```

## Testing the Chart

Before deploying to production, run the automated tests:

```bash
cd manifests/helm

# Make test script executable
chmod +x microforge/test-chart.sh

# Run tests
./microforge/test-chart.sh
```

The test script will:
- Verify prerequisites
- Lint the chart
- Validate template rendering
- Test dry-run installation
- Test all values files

## Configuration

### Common Customizations

#### Change Replica Counts

```bash
helm upgrade microforge ./microforge \
  --set frontendService.replicaCount=5 \
  --set authService.replicaCount=3
```

#### Update Image Tags

```bash
helm upgrade microforge ./microforge \
  --set frontendService.image.tag=v2.0.0 \
  --set authService.image.tag=v2.0.0
```

#### Disable Services

```bash
helm upgrade microforge ./microforge \
  --set metadataService.enabled=false \
  --set notificationService.enabled=false
```

#### Change Resource Limits

```bash
helm upgrade microforge ./microforge \
  --set loginService.resources.limits.memory=2Gi \
  --set loginService.resources.limits.cpu=2000m
```

#### Configure Ingress Hosts

```bash
helm upgrade microforge ./microforge \
  --set ingress.hosts.main=myapp.com \
  --set ingress.hosts.api=api.myapp.com
```

## Accessing the Application

### Using Port-Forward (Local Development)

```bash
# Forward frontend service
kubectl port-forward service/frontend-service 3000:80 -n microforge-dev-ns

# Access in browser
# http://localhost:3000
```

### Using Ingress (Production)

1. Update your DNS or hosts file:

**Linux/Mac** - Edit `/etc/hosts`:
```
<INGRESS_IP>  microforge.local
<INGRESS_IP>  api.microforge.local
```

**Windows** - Edit `C:\Windows\System32\drivers\etc\hosts`:
```
<INGRESS_IP>  microforge.local
<INGRESS_IP>  api.microforge.local
```

2. Get ingress IP:
```bash
kubectl get ingress -n microforge-dev-ns
```

3. Access: http://microforge.local

## Upgrading

### Upgrade to New Version

```bash
# Pull latest changes
git pull

# Upgrade the release
helm upgrade microforge ./microforge
```

### Upgrade with New Values

```bash
helm upgrade microforge ./microforge -f new-values.yaml
```

### View Upgrade History

```bash
helm history microforge -n microforge-dev-ns
```

### Rollback

If something goes wrong:

```bash
# Rollback to previous version
helm rollback microforge -n microforge-dev-ns

# Rollback to specific revision
helm rollback microforge 2 -n microforge-dev-ns
```

## Scaling

### Manual Scaling

```bash
# Scale using Helm
helm upgrade microforge ./microforge \
  --set frontendService.replicaCount=5

# Scale using kubectl
kubectl scale deployment frontend-service --replicas=5 -n microforge-dev-ns
```

### Horizontal Pod Autoscaling

To enable autoscaling, you'll need to configure HPA:

```bash
kubectl autoscale deployment frontend-service \
  --cpu-percent=70 \
  --min=2 \
  --max=10 \
  -n microforge-dev-ns
```

## Monitoring

### Check Resource Usage

```bash
# Pod resource usage
kubectl top pods -n microforge-dev-ns

# Node resource usage
kubectl top nodes
```

### View Events

```bash
kubectl get events -n microforge-dev-ns --sort-by='.lastTimestamp'
```

## Troubleshooting

### Pods Not Starting

```bash
# Describe the pod
kubectl describe pod <pod-name> -n microforge-dev-ns

# Check events
kubectl get events -n microforge-dev-ns | grep <pod-name>

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

# Test connectivity from service pod
kubectl exec -it deployment/login-service -n microforge-dev-ns -- sh
# Inside pod: ping login-mysql
```

### Ingress Not Working

```bash
# Check if ingress controller is installed
kubectl get pods -n ingress-nginx

# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.13.2/deploy/static/provider/cloud/deploy.yaml

# Check ingress resource
kubectl describe ingress -n microforge-dev-ns
```

### Chart Validation Issues

```bash
# Lint the chart
helm lint ./microforge

# Render templates to check for errors
helm template microforge ./microforge --debug

# Dry run
helm install microforge ./microforge --dry-run --debug
```

## Cleanup

### Uninstall the Release

```bash
# Uninstall
helm uninstall microforge -n microforge-dev-ns

# Delete namespace
kubectl delete namespace microforge-dev-ns
```

### Delete Persistent Volumes

```bash
# List PVCs
kubectl get pvc -n microforge-dev-ns

# Delete specific PVC
kubectl delete pvc <pvc-name> -n microforge-dev-ns

# List PVs
kubectl get pv

# Delete PV if needed
kubectl delete pv <pv-name>
```

## Best Practices

### For Production Deployments

1. **Use External Databases**: Don't run MySQL in the cluster for production
```yaml
loginMysql:
  enabled: false
notificationMysql:
  enabled: false
```

2. **Configure TLS**: Enable HTTPS with proper certificates
```yaml
ingress:
  tls:
    - secretName: microforge-tls
      hosts:
        - microforge.example.com
```

3. **Set Resource Limits**: Always define resource limits
```yaml
loginService:
  resources:
    limits:
      cpu: 2000m
      memory: 2Gi
    requests:
      cpu: 1000m
      memory: 1Gi
```

4. **Use Multiple Replicas**: Ensure high availability
```yaml
frontendService:
  replicaCount: 3
authService:
  replicaCount: 2
```

5. **Secure Secrets**: Use external secret management (e.g., Sealed Secrets, External Secrets Operator)

6. **Regular Backups**: Implement database backup strategies

7. **Monitoring**: Set up Prometheus and Grafana for monitoring

8. **Logging**: Configure centralized logging (ELK stack or similar)

## Documentation

For more detailed information, refer to:

- [Chart README](manifests/helm/microforge/README.md) - Complete parameter reference
- [Quick Start Guide](manifests/helm/microforge/QUICKSTART.md) - Fast deployment
- [Testing Guide](manifests/helm/microforge/TESTING.md) - Comprehensive testing
- [Implementation Summary](manifests/helm/HELM-CHART-SUMMARY.md) - Technical details

## Support

For issues or questions:
- GitHub Issues: https://github.com/Manoj-14/MicroForge/issues
- Email: manojmanjunathhs@gmail.com
- LinkedIn: https://linkedin.com/in/manoj-m

## Summary

The Helm chart provides:
- Complete parameterization of all Kubernetes resources
- Multi-environment support (dev, staging, production)
- Easy deployment and upgrades
- Comprehensive documentation
- Automated testing
- Production-ready configurations

You can now deploy MicroForge to any Kubernetes cluster with a single command!

