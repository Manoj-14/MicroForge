import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask settings
    SECRET_KEY = os.environ.get('FLASK_SECRET_KEY', 'dev-secret-key')
    DEBUG = os.environ.get('FLASK_ENV') == 'development'
    
    # AWS settings
    AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
    
    # Service settings
    PORT = int(os.environ.get('PORT', 8084))
    HOST = os.environ.get('HOST', '0.0.0.0')
    
    # Kubernetes settings
    KUBERNETES_NAMESPACE = os.environ.get('POD_NAMESPACE', 'default')
    NODE_NAME = os.environ.get('NODE_NAME')
    POD_NAME = os.environ.get('HOSTNAME')
