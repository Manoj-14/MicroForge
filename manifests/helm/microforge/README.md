# MicroForge Helm Chart

## Quick Start

### Prerequisites
- Kubernetes cluster
- kubectl configured
- Helm 3.0+

### Installation

1. **Ensure `src/.env` file exists** with required values:
   - `LOGIN_SERVICE_DB_USERNAME`
   - `LOGIN_SERVICE_DB_PASSWORD`
   - `LOGIN_SERVICE_JWT_SECRET`
   - `FLASK_SECRET_KEY`
   - `NOTIFICATION_SERVICE_DB_USER`
   - `NOTIFICATION_SERVICE_DB_PASSWORD`

2. **Install using helper script:**

   **Linux/Mac:**
   ```bash
   cd manifests/helm/microforge
   chmod +x install-from-env.sh
   ./install-from-env.sh
   ```

   **Windows PowerShell:**
   ```powershell
   cd manifests/helm/microforge
   .\install-from-env.ps1
   ```

   **Or install directly:**
   ```bash
   helm install microforge ./manifests/helm/microforge
   ```

### Access Services

All services are exposed via LoadBalancer:

- **Frontend**: http://localhost:3000
- **Login Service**: http://localhost:8081
- **Auth Service**: http://localhost:8082
- **Notification Service**: http://localhost:8083
- **Metadata Service**: http://localhost:8084

### Check Status

```bash
kubectl get pods -n microforge-dev-ns
kubectl get services -n microforge-dev-ns
```

### Uninstall

```bash
helm uninstall microforge -n microforge-dev-ns
```
