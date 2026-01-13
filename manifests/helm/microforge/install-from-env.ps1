# PowerShell script to install MicroForge Helm chart by reading from src/.env file
# This script reads secrets from the .env file in the src directory

param(
    [string]$ReleaseName = "microforge",
    [string]$Namespace = "microforge-dev-ns"
)

$ErrorActionPreference = "Stop"

Write-Host "MicroForge Helm Installation from .env file" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Get the script directory and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Get-Item $ScriptDir).Parent.Parent.Parent.FullName
$EnvFile = Join-Path $ProjectRoot "src\.env"

# Check if .env file exists
if (-not (Test-Path $EnvFile)) {
    Write-Host "Error: .env file not found at $EnvFile" -ForegroundColor Red
    Write-Host "Please ensure the .env file exists in the src directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "Found .env file at: $EnvFile" -ForegroundColor Green

# Read .env file and set environment variables
Get-Content $EnvFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        # Remove quotes if present
        $value = $value -replace '^["'']|["'']$', ''
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

# Check if required variables are set
$RequiredVars = @(
    "LOGIN_SERVICE_DB_USERNAME",
    "LOGIN_SERVICE_DB_PASSWORD",
    "LOGIN_SERVICE_JWT_SECRET",
    "FLASK_SECRET_KEY",
    "NOTIFICATION_SERVICE_DB_USER",
    "NOTIFICATION_SERVICE_DB_PASSWORD"
)

$MissingVars = @()

foreach ($var in $RequiredVars) {
    if (-not (Test-Path "Env:$var") -or [string]::IsNullOrEmpty((Get-Item "Env:$var").Value)) {
        $MissingVars += $var
    }
}

if ($MissingVars.Count -gt 0) {
    Write-Host "Error: The following required variables are missing from .env file:" -ForegroundColor Red
    foreach ($var in $MissingVars) {
        Write-Host "  - $var" -ForegroundColor Red
    }
    exit 1
}

$ChartPath = $ScriptDir

# Check if Helm is installed
try {
    helm version | Out-Null
} catch {
    Write-Host "Error: Helm is not installed. Please install Helm first." -ForegroundColor Red
    exit 1
}

# Check if chart exists
if (-not (Test-Path $ChartPath)) {
    Write-Host "Error: Chart directory not found at $ChartPath" -ForegroundColor Red
    exit 1
}

Write-Host "All required variables found in .env file." -ForegroundColor Green
Write-Host "Installing Helm chart..." -ForegroundColor Yellow
Write-Host "  Release name: $ReleaseName"
Write-Host "  Namespace: $Namespace"
Write-Host ""

# Build Helm install command with all secrets from .env file
$helmArgs = @(
    "install",
    $ReleaseName,
    $ChartPath,
    "--namespace", $Namespace,
    "--create-namespace",
    "--set", "loginService.secrets.dbUsername=$env:LOGIN_SERVICE_DB_USERNAME",
    "--set", "loginService.secrets.dbPassword=$env:LOGIN_SERVICE_DB_PASSWORD",
    "--set", "loginService.secrets.jwtSecret=$env:LOGIN_SERVICE_JWT_SECRET",
    "--set", "metadataService.secrets.flaskSecretKey=$env:FLASK_SECRET_KEY",
    "--set", "notificationService.secrets.mysqlUser=$env:NOTIFICATION_SERVICE_DB_USER",
    "--set", "notificationService.secrets.mysqlPassword=$env:NOTIFICATION_SERVICE_DB_PASSWORD",
    "--set", "loginMysql.secrets.rootPassword=$env:LOGIN_SERVICE_DB_PASSWORD",
    "--set", "notificationMysql.secrets.rootPassword=$env:NOTIFICATION_SERVICE_DB_PASSWORD"
)

& helm $helmArgs

Write-Host ""
Write-Host "Installation completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Access services:"
Write-Host "  Frontend: http://localhost:3000"
Write-Host "  Login: http://localhost:8081"
Write-Host "  Auth: http://localhost:8082"
Write-Host "  Notification: http://localhost:8083"
Write-Host "  Metadata: http://localhost:8084"
Write-Host ""
Write-Host "Check status: kubectl get pods -n $Namespace"

