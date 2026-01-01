#!/bin/bash
set -e

##########################################
#          Fake proxy for ingress        #
#               for minikube             #
##########################################

echo "##########################################"
echo "#          Fake proxy for ingress        #"
echo "#               for minikube             #"
echo "##########################################"

# 1. Check if Minikube is installed
echo "Is Minikube installed?"
minikube version >> /dev/null

if [ $? -eq 0 ]; then
    echo "✓ Minikube is installed"
else
    echo "Minikube is not installed"
    exit 1
fi

# 2. Check if minikube is running
echo "Checking if minikube is running..."
if ! minikube status | grep -q "Running"; then
    echo "Minikube is not running. Starting minikube..."
    minikube start
else
    echo "✓ Minikube is running"
fi

# 3. Check if ingress addon is enabled
echo "Checking if ingress addon is enabled..."
if ! minikube addons list | grep "ingress" | grep -q "enabled"; then
    echo "Enabling ingress addon..."
    minikube addons enable ingress
else
    echo "✓ Ingress addon is enabled"
fi

# 4. Update system hosts file
echo "Updating system hosts file..."
HOSTS_FILE="C:/Windows/System32/drivers/etc/hosts"
HOSTS=(
    "127.0.0.1 api.microforge.manojm.site"
    "127.0.0.1 microforge.manojm.site"
)

for HOST_ENTRY in "${HOSTS[@]}"; do
    HOSTNAME=$(echo "$HOST_ENTRY" | awk '{print $2}')
    if ! grep -q "$HOSTNAME" "$HOSTS_FILE"; then
        echo "Adding: $HOST_ENTRY"
        echo "$HOST_ENTRY" | sudo tee -a "$HOSTS_FILE" > /dev/null
    else
        echo "✓ $HOST_ENTRY already exists"
    fi
done

# 5. Start minikube tunneling
echo "Starting minikube tunnel..."
echo "Note: Keep this running in a separate terminal"
minikube tunnel