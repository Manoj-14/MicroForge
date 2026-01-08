#!/bin/bash

# MicroForge Helm Chart Test Script
# This script validates the Helm chart before deployment

set -e

CHART_DIR="./microforge"
RELEASE_NAME="microforge-test"
NAMESPACE="microforge-test-ns"

echo "=========================================="
echo "MicroForge Helm Chart Testing"
echo "=========================================="

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

if ! command -v helm &> /dev/null; then
    echo -e "${RED}ERROR: helm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Helm is installed${NC}"

if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}ERROR: kubectl is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ kubectl is installed${NC}"

if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}ERROR: Cannot connect to Kubernetes cluster${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Kubernetes cluster is accessible${NC}"

# Lint the chart
echo -e "\n${YELLOW}Linting Helm chart...${NC}"
if helm lint $CHART_DIR; then
    echo -e "${GREEN}✓ Chart linting passed${NC}"
else
    echo -e "${RED}✗ Chart linting failed${NC}"
    exit 1
fi

# Validate template rendering
echo -e "\n${YELLOW}Validating template rendering...${NC}"
if helm template test-release $CHART_DIR > /dev/null; then
    echo -e "${GREEN}✓ Templates render successfully${NC}"
else
    echo -e "${RED}✗ Template rendering failed${NC}"
    exit 1
fi

# Dry run installation
echo -e "\n${YELLOW}Performing dry-run installation...${NC}"
if helm install $RELEASE_NAME $CHART_DIR --dry-run --debug > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Dry-run installation successful${NC}"
else
    echo -e "${RED}✗ Dry-run installation failed${NC}"
    exit 1
fi

# Test with different values files
echo -e "\n${YELLOW}Testing with staging values...${NC}"
if helm template test-release $CHART_DIR -f $CHART_DIR/values-staging.yaml > /dev/null; then
    echo -e "${GREEN}✓ Staging values validation passed${NC}"
else
    echo -e "${RED}✗ Staging values validation failed${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Testing with production values...${NC}"
if helm template test-release $CHART_DIR -f $CHART_DIR/values-production.yaml > /dev/null; then
    echo -e "${GREEN}✓ Production values validation passed${NC}"
else
    echo -e "${RED}✗ Production values validation failed${NC}"
    exit 1
fi

# Optional: Actual installation test (commented by default)
# Uncomment the following section to perform actual installation
# echo -e "\n${YELLOW}Installing chart for testing...${NC}"
# kubectl create namespace $NAMESPACE
# helm install $RELEASE_NAME $CHART_DIR --namespace $NAMESPACE --wait --timeout 10m
# 
# echo -e "\n${YELLOW}Verifying installation...${NC}"
# kubectl get all -n $NAMESPACE
# 
# echo -e "\n${YELLOW}Cleaning up test installation...${NC}"
# helm uninstall $RELEASE_NAME --namespace $NAMESPACE
# kubectl delete namespace $NAMESPACE

echo -e "\n${GREEN}=========================================="
echo -e "All tests passed successfully!"
echo -e "==========================================${NC}"

