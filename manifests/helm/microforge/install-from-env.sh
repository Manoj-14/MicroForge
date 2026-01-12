#!/bin/bash
# Helper script to install MicroForge Helm chart by reading from src/.env file
# This script reads secrets from the .env file in the src directory

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}MicroForge Helm Installation from .env file${NC}"
echo "=================================================="

# Get the script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../../.." && pwd )"
ENV_FILE="$PROJECT_ROOT/src/.env"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}Error: .env file not found at $ENV_FILE${NC}"
  echo -e "${YELLOW}Please ensure the .env file exists in the src directory.${NC}"
  exit 1
fi

echo -e "${GREEN}Found .env file at: $ENV_FILE${NC}"

# Source the .env file
set -a
source "$ENV_FILE"
set +a

# Check if required variables are set
REQUIRED_VARS=(
  "LOGIN_SERVICE_DB_USERNAME"
  "LOGIN_SERVICE_DB_PASSWORD"
  "LOGIN_SERVICE_JWT_SECRET"
  "FLASK_SECRET_KEY"
  "NOTIFICATION_SERVICE_DB_USER"
  "NOTIFICATION_SERVICE_DB_PASSWORD"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
  echo -e "${RED}Error: The following required variables are missing from .env file:${NC}"
  for var in "${MISSING_VARS[@]}"; do
    echo -e "  ${RED}- $var${NC}"
  done
  exit 1
fi

# Get release name and namespace from arguments or use defaults
RELEASE_NAME=${1:-microforge}
NAMESPACE=${2:-microforge-dev-ns}
CHART_PATH="$SCRIPT_DIR"

# Check if Helm is installed
if ! command -v helm &> /dev/null; then
  echo -e "${RED}Error: Helm is not installed. Please install Helm first.${NC}"
  exit 1
fi

# Check if chart exists
if [ ! -d "$CHART_PATH" ]; then
  echo -e "${RED}Error: Chart directory not found at $CHART_PATH${NC}"
  exit 1
fi

echo -e "${GREEN}All required variables found in .env file.${NC}"
echo -e "${YELLOW}Installing Helm chart...${NC}"
echo "  Release name: $RELEASE_NAME"
echo "  Namespace: $NAMESPACE"
echo ""

# Build Helm install command with all secrets from .env file
helm install "$RELEASE_NAME" "$CHART_PATH" \
  --namespace "$NAMESPACE" \
  --create-namespace \
  --set loginService.secrets.dbUsername="$LOGIN_SERVICE_DB_USERNAME" \
  --set loginService.secrets.dbPassword="$LOGIN_SERVICE_DB_PASSWORD" \
  --set loginService.secrets.jwtSecret="$LOGIN_SERVICE_JWT_SECRET" \
  --set metadataService.secrets.flaskSecretKey="$FLASK_SECRET_KEY" \
  --set notificationService.secrets.mysqlUser="$NOTIFICATION_SERVICE_DB_USER" \
  --set notificationService.secrets.mysqlPassword="$NOTIFICATION_SERVICE_DB_PASSWORD" \
  --set loginMysql.secrets.rootPassword="$LOGIN_SERVICE_DB_PASSWORD" \
  --set notificationMysql.secrets.rootPassword="$NOTIFICATION_SERVICE_DB_PASSWORD"

echo ""
echo -e "${GREEN}Installation completed!${NC}"
echo ""
echo "Access services:"
echo "  Frontend: http://localhost:3000"
echo "  Login: http://localhost:8081"
echo "  Auth: http://localhost:8082"
echo "  Notification: http://localhost:8083"
echo "  Metadata: http://localhost:8084"
echo ""
echo "Check status: kubectl get pods -n $NAMESPACE"

