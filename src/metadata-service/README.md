## 🐍 Metadata Service (Python Flask)

### Overview
System monitoring and metadata collection service built with Python Flask, providing instance information, deployment details, and stress testing capabilities.

### Prerequisites
```bash
# Local Development
- Python 3.12+
- pip

# Verify installation
python --version
pip --version
```

### Local Development Setup
```bash
# Navigate to metadata service
cd src/metadata-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment configuration
cp .env.example .env

# Edit configuration
nano .env
```

**Required Environment Variables:**
```bash
# .env file for metadata-service
FLASK_SECRET_KEY=
FLASK_ENV=development
# AWS credentials (for EC2 metadata and optional AWS SDK calls)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1

# Kubernetes configuration (only if running out-of-cluster)
KUBECONFIG=/path/to/kubeconfig

# Service settings
METADATA_SERVICE_PORT=8084
```

### Build and Run Locally
```bash
# Install dependencies
pip install -r requirements.txt

# Run with Flask development server
export FLASK_APP=app.py
export FLASK_ENV=development
flask run --host=0.0.0.0 --port=8084

# OR run with Python directly (Windows)
python app.py

# Run with Gunicorn (production-like)
gunicorn app:app --workers 4 --bind 0.0.0.0:8084

# With custom configuration
gunicorn app:app --workers 2 --bind 0.0.0.0:8084 --log-level info
```

### Docker Build
```bash
# Build Docker image locally
docker build -t microforge-metadata-service:local .

# Run with Docker
docker run -p 8084:8084 \
  -e METADATA_SERVICE_PORT=8084 \
  -e FLASK_SECRET_KEY=your-secret-key \
  microforge-metadata-service:local
```