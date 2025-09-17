import os
import requests
from utils.logger import setup_logger

logger = setup_logger(__name__)

class EnvironmentDetector:
    def detect_environment(self):
        """Detect the current runtime environment"""
        
        # Check for Kubernetes environment
        if self._is_kubernetes():
            return 'kubernetes'
        
        # Check for AWS environment
        if self._is_aws():
            return 'aws'
        
        # Default to local
        return 'local'
    
    def _is_kubernetes(self):
        """Check if running in Kubernetes"""
        try:
            # Check for Kubernetes service account
            if os.path.exists('/var/run/secrets/kubernetes.io/serviceaccount'):
                return True
            
            # Check for Kubernetes environment variables
            if os.environ.get('KUBERNETES_SERVICE_HOST'):
                return True
                
            return False
            
        except Exception as e:
            logger.debug(f"Error checking Kubernetes environment: {str(e)}")
            return False
    
    def _is_aws(self):
        """Check if running on AWS"""
        try:
            # Try to access EC2 metadata service
            response = requests.get(
                "http://169.254.169.254/latest/meta-data/instance-id",
                timeout=2
            )
            return response.status_code == 200
            
        except requests.exceptions.RequestException:
            logger.debug("Not running on AWS EC2")
            return False