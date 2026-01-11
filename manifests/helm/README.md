# MicroForge Helm Charts

This directory contains Helm charts for deploying the MicroForge microservices platform to Kubernetes.

## Available Charts

### microforge

Main chart for deploying the complete MicroForge platform including:
- Frontend Service (React)
- Auth Service (Go)
- Login Service (Java Spring Boot)
- Metadata Service (Python Flask)
- Notification Service (Node.js)
- MySQL Databases (Login and Notification)

## Quick Start

```bash
# Install the chart
helm install microforge ./microforge

# Install with custom namespace
helm install microforge ./microforge --namespace microforge-dev-ns --create-namespace

# Install with custom values
helm install microforge ./microforge -f custom-values.yaml
```

## Documentation

- [Chart README](microforge/README.md) - Complete documentation
- [Quick Start Guide](microforge/QUICKSTART.md) - Fast deployment guide
- [Testing Guide](microforge/TESTING.md) - Testing procedures
- [Implementation Summary](HELM-CHART-SUMMARY.md) - Technical details

## Environment-Specific Values

- `microforge/values.yaml` - Default/development configuration
- `microforge/values-staging.yaml` - Staging environment
- `microforge/values-production.yaml` - Production environment

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- kubectl configured
- NGINX Ingress Controller (optional, for ingress)

## Installation Examples

### Development Environment
```bash
helm install microforge ./microforge
```

### Staging Environment
```bash
helm install microforge ./microforge -f ./microforge/values-staging.yaml
```

### Production Environment
```bash
helm install microforge ./microforge -f ./microforge/values-production.yaml
```

## Testing

Run the automated test script:

```bash
cd microforge
chmod +x test-chart.sh
./test-chart.sh
```

## Common Operations

### View Chart Values
```bash
helm show values ./microforge
```

### Lint the Chart
```bash
helm lint ./microforge
```

### Template Rendering
```bash
helm template microforge ./microforge
```

### Upgrade
```bash
helm upgrade microforge ./microforge
```

### Rollback
```bash
helm rollback microforge
```

### Uninstall
```bash
helm uninstall microforge
```

## Support

For detailed information, refer to the [Chart README](microforge/README.md).

For issues or questions:
- GitHub: https://github.com/Manoj-14/MicroForge
- Email: manojmanjunathhs@gmail.com

