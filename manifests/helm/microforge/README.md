# MicroForge Helm Chart

This Helm chart deploys the MicroForge microservices platform to a Kubernetes cluster.

## Overview

MicroForge is an enterprise-grade microservices platform consisting of:
- Frontend Service (React)
- Auth Service (Go)
- Login Service (Java Spring Boot)
- Metadata Service (Python Flask)
- Notification Service (Node.js)
- MySQL Databases (2 instances)

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- PV provisioner support in the underlying infrastructure (for persistent storage)
- NGINX Ingress Controller (if ingress is enabled)

## Installation

### Install from local chart directory

```bash
# Navigate to the chart directory
cd manifests/helm

# Install the chart with release name "microforge"
helm install microforge ./microforge
```

### Install with custom namespace

```bash
helm install microforge ./microforge --namespace microforge-dev-ns --create-namespace
```

### Install with custom values

```bash
helm install microforge ./microforge -f custom-values.yaml
```

## Configuration

The following table lists the configurable parameters of the MicroForge chart and their default values.

### Global Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `global.namespace` | Default namespace for all resources | `microforge-dev-ns` |
| `global.environment` | Environment name | `development` |

### Namespace Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `namespace.create` | Create namespace if it doesn't exist | `true` |
| `namespace.name` | Namespace name | `microforge-dev-ns` |

### Ingress Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.className` | Ingress class name | `nginx` |
| `ingress.hosts.main` | Main application hostname | `microforge.local` |
| `ingress.hosts.api` | API gateway hostname | `api.microforge.local` |

### Frontend Service

| Parameter | Description | Default |
|-----------|-------------|---------|
| `frontendService.enabled` | Enable frontend service | `true` |
| `frontendService.replicaCount` | Number of replicas | `1` |
| `frontendService.image.repository` | Image repository | `manojmdocker14/microforge-frontend-service` |
| `frontendService.image.tag` | Image tag | `v1.1.0` |
| `frontendService.service.type` | Service type | `ClusterIP` |
| `frontendService.service.port` | Service port | `80` |
| `frontendService.resources.limits.cpu` | CPU limit | `500m` |
| `frontendService.resources.limits.memory` | Memory limit | `512Mi` |

### Auth Service

| Parameter | Description | Default |
|-----------|-------------|---------|
| `authService.enabled` | Enable auth service | `true` |
| `authService.replicaCount` | Number of replicas | `1` |
| `authService.image.repository` | Image repository | `manojmdocker14/microforge-auth-service` |
| `authService.image.tag` | Image tag | `v1.1.0` |
| `authService.service.port` | Service port | `8082` |
| `authService.config.port` | Application port | `"8082"` |

### Login Service

| Parameter | Description | Default |
|-----------|-------------|---------|
| `loginService.enabled` | Enable login service | `true` |
| `loginService.replicaCount` | Number of replicas | `1` |
| `loginService.image.repository` | Image repository | `manojmdocker14/microforge-login-service` |
| `loginService.image.tag` | Image tag | `v1.2.0` |
| `loginService.service.port` | Service port | `8081` |
| `loginService.config.dbName` | Database name | `empdir` |
| `loginService.secrets.dbUsername` | Database username | `root` |
| `loginService.secrets.dbPassword` | Database password | `loginroot` |

### Metadata Service

| Parameter | Description | Default |
|-----------|-------------|---------|
| `metadataService.enabled` | Enable metadata service | `true` |
| `metadataService.replicaCount` | Number of replicas | `1` |
| `metadataService.image.repository` | Image repository | `manojmdocker14/microforge-metadata-service` |
| `metadataService.image.tag` | Image tag | `v1.0.0` |
| `metadataService.service.port` | Service port | `8084` |
| `metadataService.config.flaskEnv` | Flask environment | `development` |

### Notification Service

| Parameter | Description | Default |
|-----------|-------------|---------|
| `notificationService.enabled` | Enable notification service | `true` |
| `notificationService.replicaCount` | Number of replicas | `1` |
| `notificationService.image.repository` | Image repository | `manojmdocker14/microforge-notification-service` |
| `notificationService.image.tag` | Image tag | `v1.0.0` |
| `notificationService.service.port` | Service port | `8083` |
| `notificationService.secrets.mysqlUser` | MySQL username | `root` |
| `notificationService.secrets.mysqlPassword` | MySQL password | `root` |

### Login MySQL

| Parameter | Description | Default |
|-----------|-------------|---------|
| `loginMysql.enabled` | Enable login MySQL | `true` |
| `loginMysql.replicaCount` | Number of replicas | `1` |
| `loginMysql.image.repository` | Image repository | `manojmdocker14/microforge-users-mysql` |
| `loginMysql.image.tag` | Image tag | `v1.0.0` |
| `loginMysql.persistence.enabled` | Enable persistent storage | `true` |
| `loginMysql.persistence.size` | Storage size | `5Gi` |
| `loginMysql.secrets.rootPassword` | Root password | `loginroot` |

### Notification MySQL

| Parameter | Description | Default |
|-----------|-------------|---------|
| `notificationMysql.enabled` | Enable notification MySQL | `true` |
| `notificationMysql.replicaCount` | Number of replicas | `1` |
| `notificationMysql.image.repository` | Image repository | `manojmdocker14/microforge-notifications-mysql` |
| `notificationMysql.image.tag` | Image tag | `v1.0.0` |
| `notificationMysql.persistence.enabled` | Enable persistent storage | `true` |
| `notificationMysql.persistence.size` | Storage size | `5Gi` |
| `notificationMysql.secrets.rootPassword` | Root password | `root` |

## Usage Examples

### Install with custom replica counts

Create a `custom-values.yaml` file:

```yaml
frontendService:
  replicaCount: 3

authService:
  replicaCount: 2

loginService:
  replicaCount: 2
```

Install with custom values:

```bash
helm install microforge ./microforge -f custom-values.yaml
```

### Install with custom ingress hosts

```yaml
ingress:
  enabled: true
  hosts:
    main: myapp.example.com
    api: api.myapp.example.com
```

```bash
helm install microforge ./microforge -f custom-values.yaml
```

### Install without ingress (use port-forwarding)

```yaml
ingress:
  enabled: false
```

```bash
helm install microforge ./microforge -f custom-values.yaml
```

### Disable specific services

```yaml
metadataService:
  enabled: false

notificationService:
  enabled: false
```

```bash
helm install microforge ./microforge -f custom-values.yaml
```

### Custom resource limits

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

## Upgrading

### Upgrade to a new version

```bash
helm upgrade microforge ./microforge
```

### Upgrade with new values

```bash
helm upgrade microforge ./microforge -f new-values.yaml
```

### Upgrade with specific parameters

```bash
helm upgrade microforge ./microforge \
  --set frontendService.replicaCount=5 \
  --set authService.image.tag=v2.0.0
```

### View upgrade history

```bash
helm history microforge
```

### Rollback to previous version

```bash
helm rollback microforge
```

### Rollback to specific revision

```bash
helm rollback microforge 2
```

## Uninstallation

```bash
helm uninstall microforge
```

To also delete the namespace:

```bash
helm uninstall microforge
kubectl delete namespace microforge-dev-ns
```

## Testing the Installation

### Check deployment status

```bash
# Check all resources
kubectl get all -n microforge-dev-ns

# Check pods
kubectl get pods -n microforge-dev-ns

# Check services
kubectl get services -n microforge-dev-ns

# Check ingress
kubectl get ingress -n microforge-dev-ns
```

### Access the application

#### Using Ingress

Add entries to your `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1  microforge.local
127.0.0.1  api.microforge.local
```

Access: http://microforge.local

#### Using Port Forwarding

```bash
# Frontend
kubectl port-forward service/frontend-service 3000:80 -n microforge-dev-ns

# Auth Service
kubectl port-forward service/auth-service 8082:8082 -n microforge-dev-ns

# Login Service
kubectl port-forward service/login-service 8081:8081 -n microforge-dev-ns

# Notification Service
kubectl port-forward service/notification-service 8083:8083 -n microforge-dev-ns

# Metadata Service
kubectl port-forward service/metadata-service 8084:8084 -n microforge-dev-ns
```

### Health Checks

```bash
# Auth Service
curl http://localhost:8082/api/health

# Login Service
curl http://localhost:8081/actuator/health

# Notification Service
curl http://localhost:8083/actuator/health

# Metadata Service
curl http://localhost:8084/api/health
```

## Troubleshooting

### Pods not starting

```bash
# Describe pod to see events
kubectl describe pod <pod-name> -n microforge-dev-ns

# View pod logs
kubectl logs <pod-name> -n microforge-dev-ns

# View previous logs (if pod restarted)
kubectl logs <pod-name> -n microforge-dev-ns --previous
```

### Database connection issues

```bash
# Check MySQL pods
kubectl get pods -l app=login-mysql -n microforge-dev-ns
kubectl get pods -l app=notification-mysql -n microforge-dev-ns

# View MySQL logs
kubectl logs deployment/login-mysql -n microforge-dev-ns
kubectl logs deployment/notification-mysql -n microforge-dev-ns

# Test database connectivity from a service pod
kubectl exec -it deployment/login-service -n microforge-dev-ns -- sh
# Inside the pod:
# ping login-mysql
```

### Persistent volume issues

```bash
# Check PVCs
kubectl get pvc -n microforge-dev-ns

# Describe PVC
kubectl describe pvc login-mysql-pvc -n microforge-dev-ns

# Check PVs
kubectl get pv
```

### Ingress not working

```bash
# Check if ingress controller is running
kubectl get pods -n ingress-nginx

# Check ingress resource
kubectl describe ingress microforge-ingress -n microforge-dev-ns

# View ingress controller logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

## Chart Development

### Validate the chart

```bash
helm lint ./microforge
```

### Render templates locally

```bash
helm template microforge ./microforge
```

### Dry run installation

```bash
helm install microforge ./microforge --dry-run --debug
```

### Package the chart

```bash
helm package ./microforge
```

## Best Practices

### Production Deployment

For production deployments, consider:

1. **Use external databases**: Instead of deploying MySQL in the cluster, use managed database services (AWS RDS, Azure Database, etc.)

2. **Enable TLS**: Configure TLS certificates for ingress

```yaml
ingress:
  enabled: true
  tls:
    - secretName: microforge-tls
      hosts:
        - microforge.example.com
        - api.microforge.example.com
```

3. **Set resource limits**: Always define resource limits and requests

4. **Use multiple replicas**: Deploy multiple replicas for high availability

```yaml
frontendService:
  replicaCount: 3

authService:
  replicaCount: 2

loginService:
  replicaCount: 2
```

5. **Disable persistence for databases**: Use external databases instead

```yaml
loginMysql:
  enabled: false

notificationMysql:
  enabled: false
```

6. **Use external secrets**: Consider using tools like Sealed Secrets or External Secrets Operator

7. **Configure proper monitoring**: Integrate with Prometheus and Grafana

8. **Set up backup strategies**: Implement database backup strategies

### Security Considerations

1. Change default passwords in `values.yaml`
2. Use Kubernetes secrets for sensitive data
3. Enable RBAC
4. Use network policies to restrict pod communication
5. Scan container images for vulnerabilities
6. Keep images up to date

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/Manoj-14/MicroForge/issues
- Documentation: https://github.com/Manoj-14/MicroForge

## License

This chart is licensed under the GPL v3 License. See the LICENSE file for details.

## Maintainers

- Manoj M - DevOps Engineer & Full-Stack Developer
  - Email: manojmanjunathhs@gmail.com
  - LinkedIn: https://linkedin.com/in/manoj-m

