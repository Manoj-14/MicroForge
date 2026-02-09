#!/bin/bash
set -e

echo "Initializing Terraform..."
terraform init -input=false

echo "Validating configuration..."
terraform validate

echo "Formatting code..."
terraform fmt -recursive

echo "Initialization complete."
