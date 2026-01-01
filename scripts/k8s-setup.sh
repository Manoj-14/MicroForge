#!/bin/bash
set -e

echo "Setting up Kubernetes in GitHub Runner..."

# Install kubectl
echo "Installing kubectl..."
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Verify installation
echo "Verifying Kubernetes setup..."
kubectl cluster-info
kubectl get nodes

echo "Kubernetes setup complete!"