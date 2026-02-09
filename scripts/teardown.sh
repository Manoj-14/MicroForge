#!/bin/bash
set -e

echo "Destroying Terraform-managed resources..."
terraform destroy --auto-approve

echo "Teardown complete."
