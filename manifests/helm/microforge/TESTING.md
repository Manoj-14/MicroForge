# MicroForge Helm Chart Testing Guide

This document provides comprehensive testing procedures for the MicroForge Helm chart.

## Prerequisites

- Kubernetes cluster (Docker Desktop, Minikube, or cloud)
- kubectl configured
- Helm 3.0+
- Access to create namespaces and deploy resources

## Testing Levels

### 1. Static Analysis

#### Lint the Chart

```bash
cd manifests/helm

# Lint the chart
helm lint ./microforge

# Expected output: No errors or warnings
```

#### Validate Template Rendering

```bash
# Render templates without installation
helm template microforge ./microforge

# Save rendered templates to file for inspection
helm template microforge ./microforge > rendered-templates.yaml
```

#### Check for Common Issues

```bash
# Verify Chart.yaml
cat ./microforge/Chart.yaml

# Verify values.yaml syntax
helm show values ./microforge

# Check for required files
ls -la ./microforge/templates/
```

### 2. Dry Run Testing

#### Basic Dry Run

```bash
# Install in dry-run mode
helm install microforge ./microforge --dry-run --debug
```

#### Test with Different Values

```bash
# Test with staging values
helm install microforge ./microforge \
  -f ./microforge/values-staging.yaml \
  --dry-run --debug

# Test with production values
helm install microforge ./microforge \
  -f ./microforge/values-production.yaml \
  --dry-run --debug

# Test with custom values
helm install microforge ./microforge \
  --set frontendService.replicaCount=5 \
  --set authService.replicaCount=3 \
  --dry-run --debug
```

#### Test Individual Components

```bash
# Test with specific services disabled
helm install microforge ./microforge \
  --set metadataService.enabled=false \
  --set notificationService.enabled=false \
  --dry-run --debug

# Test without ingress
helm install microforge ./microforge \
  --set ingress.enabled=false \
  --dry-run --debug
```

### 3. Automated Testing Script

Run the provided test script:

```bash
cd manifests/helm

# Make the script executable
chmod +x microforge/test-chart.sh

# Run the test script
./microforge/test-chart.sh
```

The script will:
- Check prerequisites (helm, kubectl, cluster connectivity)
- Lint the chart
- Validate template rendering
- Test dry-run installation
- Test with different values files

### 4. Local Installation Testing

#### Install in Test Namespace

```bash
# Create test namespace
kubectl create namespace microforge-test

# Install the chart
helm install microforge-test ./microforge \
  --namespace microforge-test \
  --wait \
  --timeout 10m

# Check installation status
helm status microforge-test -n microforge-test

# List all resources
kubectl get all -n microforge-test
```

#### Verify Pods

```bash
# Check pods are running
kubectl get pods -n microforge-test

# Wait for all pods to be ready
kubectl wait --for=condition=ready pod --all -n microforge-test --timeout=300s

# Check pod logs
kubectl logs -l app=frontend-service -n microforge-test
kubectl logs -l app=auth-service -n microforge-test
kubectl logs -l app=login-service -n microforge-test
```

#### Verify Services

```bash
# Check services
kubectl get services -n microforge-test

# Check service endpoints
kubectl get endpoints -n microforge-test

# Test service DNS resolution
kubectl run -it --rm debug --image=busybox --restart=Never -n microforge-test \
  -- nslookup frontend-service
```

#### Verify ConfigMaps and Secrets

```bash
# Check ConfigMaps
kubectl get configmaps -n microforge-test

# Verify ConfigMap data
kubectl describe configmap auth-service-config -n microforge-test

# Check Secrets (without revealing values)
kubectl get secrets -n microforge-test
```

#### Verify Ingress

```bash
# Check ingress
kubectl get ingress -n microforge-test

# Describe ingress
kubectl describe ingress -n microforge-test

# Test ingress rules
curl -H "Host: microforge.local" http://<ingress-ip>
```

### 5. Functional Testing

#### Test Frontend Service

```bash
# Port forward frontend
kubectl port-forward service/frontend-service 3000:80 -n microforge-test

# In another terminal, test the endpoint
curl http://localhost:3000
```

#### Test Auth Service

```bash
# Port forward auth service
kubectl port-forward service/auth-service 8082:8082 -n microforge-test

# Test health endpoint
curl http://localhost:8082/api/health
```

#### Test Login Service

```bash
# Port forward login service
kubectl port-forward service/login-service 8081:8081 -n microforge-test

# Test health endpoint
curl http://localhost:8081/actuator/health
```

#### Test Notification Service

```bash
# Port forward notification service
kubectl port-forward service/notification-service 8083:8083 -n microforge-test

# Test health endpoint
curl http://localhost:8083/actuator/health
```

#### Test Metadata Service

```bash
# Port forward metadata service
kubectl port-forward service/metadata-service 8084:8084 -n microforge-test

# Test health endpoint
curl http://localhost:8084/api/health
```

#### Test Database Connectivity

```bash
# Test login MySQL
kubectl exec -it deployment/login-mysql -n microforge-test -- \
  mysql -u root -p<password> -e "SHOW DATABASES;"

# Test notification MySQL
kubectl exec -it deployment/notification-mysql -n microforge-test -- \
  mysql -u root -p<password> -e "SHOW DATABASES;"
```

### 6. Upgrade Testing

#### Test Upgrade Path

```bash
# Initial installation
helm install microforge-test ./microforge -n microforge-test

# Modify values
cat > custom-values.yaml <<EOF
frontendService:
  replicaCount: 2
authService:
  replicaCount: 2
EOF

# Perform upgrade
helm upgrade microforge-test ./microforge \
  -f custom-values.yaml \
  -n microforge-test

# Check upgrade status
helm status microforge-test -n microforge-test

# View upgrade history
helm history microforge-test -n microforge-test
```

#### Test Rollback

```bash
# Rollback to previous version
helm rollback microforge-test -n microforge-test

# Verify rollback
helm history microforge-test -n microforge-test
kubectl get pods -n microforge-test
```

### 7. Cleanup Testing

```bash
# Uninstall the release
helm uninstall microforge-test -n microforge-test

# Verify all resources are removed
kubectl get all -n microforge-test

# Check for remaining resources
kubectl get pvc -n microforge-test
kubectl get configmaps -n microforge-test
kubectl get secrets -n microforge-test

# Delete namespace
kubectl delete namespace microforge-test
```

## Integration Testing

### Test Service Communication

```bash
# Deploy a test pod
kubectl run test-pod --image=curlimages/curl -n microforge-test -- sleep 3600

# Test internal service communication
kubectl exec -it test-pod -n microforge-test -- \
  curl http://auth-service:8082/api/health

kubectl exec -it test-pod -n microforge-test -- \
  curl http://login-service:8081/actuator/health

kubectl exec -it test-pod -n microforge-test -- \
  curl http://notification-service:8083/actuator/health

kubectl exec -it test-pod -n microforge-test -- \
  curl http://metadata-service:8084/api/health

# Cleanup
kubectl delete pod test-pod -n microforge-test
```

### Test Database Connectivity from Services

```bash
# Check login service can connect to login-mysql
kubectl logs -l app=login-service -n microforge-test | grep -i "database\|connection"

# Check notification service can connect to notification-mysql
kubectl logs -l app=notification-service -n microforge-test | grep -i "database\|connection"
```

## Performance Testing

### Load Testing

```bash
# Install Apache Bench (if not already installed)
# On Ubuntu: sudo apt-get install apache2-utils
# On Mac: brew install ab

# Port forward frontend
kubectl port-forward service/frontend-service 3000:80 -n microforge-test &

# Run load test
ab -n 1000 -c 10 http://localhost:3000/

# Kill port forward
kill %1
```

### Resource Monitoring

```bash
# Monitor resource usage
kubectl top pods -n microforge-test
kubectl top nodes

# Watch pod status
watch kubectl get pods -n microforge-test

# Monitor events
kubectl get events -n microforge-test --watch
```

## Security Testing

### Check for Security Issues

```bash
# Check for privileged containers
kubectl get pods -n microforge-test -o json | \
  jq '.items[].spec.containers[].securityContext'

# Check for host network usage
kubectl get pods -n microforge-test -o json | \
  jq '.items[].spec.hostNetwork'

# Verify secrets are not exposed
kubectl get pods -n microforge-test -o yaml | grep -A5 "env:"
```

## Test Checklist

Use this checklist for comprehensive testing:

- [ ] Chart linting passes without errors
- [ ] Template rendering works correctly
- [ ] Dry-run installation succeeds
- [ ] All values files (default, staging, production) validate
- [ ] Chart installs successfully in test namespace
- [ ] All pods reach Running state
- [ ] All services are accessible
- [ ] ConfigMaps contain correct data
- [ ] Secrets are created properly
- [ ] Ingress is configured correctly
- [ ] Frontend service is accessible
- [ ] Auth service health check passes
- [ ] Login service health check passes
- [ ] Notification service health check passes
- [ ] Metadata service health check passes
- [ ] Database connections work
- [ ] Inter-service communication works
- [ ] Upgrade path works correctly
- [ ] Rollback works correctly
- [ ] Uninstallation removes all resources
- [ ] No orphaned PVCs or PVs remain

## Common Issues and Solutions

### Pods Stuck in Pending

**Cause**: Insufficient cluster resources or PV issues

**Solution**:
```bash
kubectl describe pod <pod-name> -n microforge-test
# Check events section for specific error
```

### Image Pull Errors

**Cause**: Image doesn't exist or network issues

**Solution**:
```bash
# Verify image exists
docker pull manojmdocker14/microforge-frontend-service:v1.1.0

# Check image pull policy
kubectl get deployment frontend-service -n microforge-test -o yaml | grep imagePullPolicy
```

### Database Connection Failures

**Cause**: MySQL pod not ready or wrong credentials

**Solution**:
```bash
# Check MySQL pod status
kubectl get pods -l app=login-mysql -n microforge-test

# Check MySQL logs
kubectl logs deployment/login-mysql -n microforge-test

# Verify secrets
kubectl get secret login-mysql-secret -n microforge-test -o yaml
```

## Reporting Issues

When reporting issues, include:
1. Output of `helm version`
2. Output of `kubectl version`
3. Output of `helm list -n microforge-test`
4. Output of `kubectl get pods -n microforge-test`
5. Relevant logs from failing pods
6. Describe output of problematic resources

## Conclusion

Following these testing procedures ensures the Helm chart:
- Is syntactically correct
- Deploys successfully
- Functions as expected
- Can be upgraded and rolled back
- Cleans up properly when uninstalled

For production deployments, consider additional testing:
- Security scanning
- Compliance checks
- Backup and restore procedures
- Disaster recovery scenarios

