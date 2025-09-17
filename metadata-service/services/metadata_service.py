import platform
import boto3
import requests
import socket
import psutil
import os
import json
from datetime import datetime
from kubernetes import client, config
from .environment_detector import EnvironmentDetector
from utils.logger import setup_logger

logger = setup_logger(__name__)

class   MetadataService:
    def __init__(self):
        self.env_detector = EnvironmentDetector()
        self.environment = self.env_detector.detect_environment()
        
        # Initialize AWS clients
        try:
            self.ec2_client = boto3.client('ec2', region_name=self._get_aws_region())
            self.session = boto3.Session()
        except:
            self.ec2_client = None
            self.session = None
        
        # Initialize Kubernetes client
        self.k8s_client = None
        if self.environment == 'kubernetes':
            try:
                config.load_incluster_config()  # For in-cluster
                self.k8s_client = client.CoreV1Api()
            except:
                try:
                    config.load_kube_config()  # For local development
                    self.k8s_client = client.CoreV1Api()
                except:
                    logger.warning("Could not initialize Kubernetes client")

    def get_instance_metadata(self):
        """Get instance metadata based on environment"""
        try:
            if self.environment == 'aws':
                return self._get_aws_instance_metadata()
            elif self.environment == 'kubernetes':
                return self._get_k8s_node_metadata()
            else:
                return self._get_local_metadata()
        except Exception as e:
            logger.error(f"Error getting instance metadata: {str(e)}")
            return self.get_dummy_metadata()

    def _get_aws_instance_metadata(self):
        """Get AWS EC2 instance metadata"""
        try:
            # AWS Instance Metadata Service v2
            token_url = "http://169.254.169.254/latest/api/token"
            metadata_url = "http://169.254.169.254/latest/meta-data"
            
            # Get token
            token_response = requests.put(
                token_url,
                headers={"X-aws-ec2-metadata-token-ttl-seconds": "21600"},
                timeout=2
            )
            token = token_response.text
            
            headers = {"X-aws-ec2-metadata-token": token}
            
            # Get instance metadata
            instance_id = requests.get(f"{metadata_url}/instance-id", headers=headers, timeout=2).text
            instance_type = requests.get(f"{metadata_url}/instance-type", headers=headers, timeout=2).text
            region = requests.get(f"{metadata_url}/placement/region", headers=headers, timeout=2).text
            availability_zone = requests.get(f"{metadata_url}/placement/availability-zone", headers=headers, timeout=2).text
            private_ip = requests.get(f"{metadata_url}/local-ipv4", headers=headers, timeout=2).text
            
            try:
                public_ip = requests.get(f"{metadata_url}/public-ipv4", headers=headers, timeout=2).text
            except:
                public_ip = None
            
            # Get additional instance details
            instance_details = {}
            if self.ec2_client:
                try:
                    response = self.ec2_client.describe_instances(InstanceIds=[instance_id])
                    instance = response['Reservations'][0]['Instances'][0]
                    
                    instance_details = {
                        'launch_time': instance.get('LaunchTime', '').isoformat() if instance.get('LaunchTime') else None,
                        'subnet_id': instance.get('SubnetId'),
                        'vpc_id': instance.get('VpcId'),
                        'security_groups': [sg['GroupName'] for sg in instance.get('SecurityGroups', [])],
                        'tags': {tag['Key']: tag['Value'] for tag in instance.get('Tags', [])}
                    }
                except Exception as e:
                    logger.warning(f"Could not get additional EC2 details: {str(e)}")
            
            return {
                'environment': 'aws',
                'instance_id': instance_id,
                'instance_type': instance_type,
                'region': region,
                'availability_zone': availability_zone,
                'private_ip': private_ip,
                'public_ip': public_ip,
                'hostname': socket.gethostname(),
                'platform': 'EC2',
                **instance_details
            }
            
        except requests.exceptions.RequestException:
            logger.info("Not running on AWS EC2, using local metadata")
            return self._get_local_metadata()

    def _get_k8s_node_metadata(self):
        """Get Kubernetes node metadata"""
        try:
            node_name = os.environ.get('NODE_NAME') or socket.gethostname()
            pod_name = os.environ.get('HOSTNAME') or socket.gethostname()
            namespace = os.environ.get('POD_NAMESPACE', 'default')
            
            node_info = {}
            if self.k8s_client:
                try:
                    # Get node information
                    node = self.k8s_client.read_node(node_name)
                    node_info = {
                        'node_labels': node.metadata.labels,
                        'node_annotations': node.metadata.annotations,
                        'node_capacity': node.status.capacity,
                        'node_allocatable': node.status.allocatable,
                        'node_conditions': [
                            {
                                'type': condition.type,
                                'status': condition.status,
                                'reason': condition.reason
                            } for condition in (node.status.conditions or [])
                        ]
                    }
                    
                    # Try to get pod information
                    try:
                        pod = self.k8s_client.read_namespaced_pod(pod_name, namespace)
                        node_info.update({
                            'pod_ip': pod.status.pod_ip,
                            'host_ip': pod.status.host_ip,
                            'pod_labels': pod.metadata.labels,
                            'pod_annotations': pod.metadata.annotations
                        })
                    except:
                        pass
                        
                except Exception as e:
                    logger.warning(f"Could not get K8s node details: {str(e)}")
            
            # Get region from node labels or environment
            region = 'unknown'
            zone = 'unknown'
            
            if 'node_labels' in node_info:
                region = (node_info['node_labels'].get('topology.kubernetes.io/region') or 
                         node_info['node_labels'].get('failure-domain.beta.kubernetes.io/region') or 
                         'unknown')
                zone = (node_info['node_labels'].get('topology.kubernetes.io/zone') or 
                       node_info['node_labels'].get('failure-domain.beta.kubernetes.io/zone') or 
                       'unknown')
            
            return {
                'environment': 'kubernetes',
                'node_name': node_name,
                'pod_name': pod_name,
                'namespace': namespace,
                'region': region,
                'availability_zone': zone,
                'hostname': socket.gethostname(),
                'platform': 'Kubernetes',
                'private_ip': self._get_private_ip(),
                **node_info
            }
            
        except Exception as e:
            logger.error(f"Error getting K8s metadata: {str(e)}")
            return self._get_local_metadata()

    def _get_local_metadata(self):
        """Get real local development metadata"""
        return {
            'environment': 'local',
            'hostname': socket.gethostname(),
            'private_ip': self._get_private_ip(),
            'platform': platform.system(),
            'platform_release': platform.release(),
            'platform_version': platform.version(),
            'architecture': platform.machine(),
            'cpu_count': psutil.cpu_count(logical=True),
            'memory_total_gb': round(psutil.virtual_memory().total / (1024**3), 2),
            'disk_total_gb': round(psutil.disk_usage('/').total / (1024**3), 2),
            'region': os.environ.get('LOCAL_REGION', 'local'),
            'availability_zone': os.environ.get('LOCAL_AZ', socket.gethostname()),
            'instance_id': f"local-{socket.gethostname()}",
            'note': 'Running in local development mode'
        }

    def get_deployment_info(self):
        """Get deployment information"""
        try:
            deployment_info = {
                'service_name': 'metadata-service',
                'version': '1.0.0',
                'environment': self.environment,
                'start_time': datetime.utcnow().isoformat() + 'Z',
                'uptime_seconds': int(psutil.boot_time()),
                'platform_info': self._get_platform_info()
            }
            
            if self.environment == 'aws':
                deployment_info.update({
                    'cloud_provider': 'AWS',
                    'deployment_type': 'EC2'
                })
            elif self.environment == 'kubernetes':
                deployment_info.update({
                    'deployment_type': 'Kubernetes',
                    'container_runtime': 'docker'
                })
            else:
                deployment_info.update({
                    'deployment_type': 'Local'
                })
                
            return deployment_info
            
        except Exception as e:
            logger.error(f"Error getting deployment info: {str(e)}")
            return self.get_dummy_deployment_info()

    def get_network_info(self):
        """Get network information"""
        try:
            network_interfaces = []
            
            for interface, addresses in psutil.net_if_addrs().items():
                interface_info = {
                    'name': interface,
                    'addresses': []
                }
                
                for addr in addresses:
                    if addr.family == socket.AF_INET:  # IPv4
                        interface_info['addresses'].append({
                            'type': 'IPv4',
                            'address': addr.address,
                            'netmask': addr.netmask
                        })
                    elif addr.family == socket.AF_INET6:  # IPv6
                        interface_info['addresses'].append({
                            'type': 'IPv6',
                            'address': addr.address,
                            'netmask': addr.netmask
                        })
                
                if interface_info['addresses']:
                    network_interfaces.append(interface_info)
            
            # Get network statistics
            net_io = psutil.net_io_counters()
            
            return {
                'interfaces': network_interfaces,
                'primary_ip': self._get_private_ip(),
                'hostname': socket.gethostname(),
                'network_stats': {
                    'bytes_sent': net_io.bytes_sent,
                    'bytes_recv': net_io.bytes_recv,
                    'packets_sent': net_io.packets_sent,
                    'packets_recv': net_io.packets_recv
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting network info: {str(e)}")
            raise

    def get_system_info(self):
        """Get system information"""
        try:
            cpu_info = {
                'count': psutil.cpu_count(),
                'usage_percent': psutil.cpu_percent(interval=1)
            }
            
            memory = psutil.virtual_memory()
            memory_info = {
                'total_gb': round(memory.total / (1024**3), 2),
                'available_gb': round(memory.available / (1024**3), 2),
                'used_percent': memory.percent
            }
            
            disk = psutil.disk_usage('/')
            disk_info = {
                'total_gb': round(disk.total / (1024**3), 2),
                'used_gb': round(disk.used / (1024**3), 2),
                'free_gb': round(disk.free / (1024**3), 2),
                'used_percent': round((disk.used / disk.total) * 100, 1)
            }
            
            return {
                'cpu': cpu_info,
                'memory': memory_info,
                'disk': disk_info,
                'load_average': os.getloadavg() if hasattr(os, 'getloadavg') else None
            }
            
        except Exception as e:
            logger.error(f"Error getting system info: {str(e)}")
            return {
                'cpu': {'count': 1, 'usage_percent': 0},
                'memory': {'total_gb': 1, 'available_gb': 1, 'used_percent': 0},
                'disk': {'total_gb': 10, 'used_gb': 1, 'free_gb': 9, 'used_percent': 10}
            }

    def _get_private_ip(self):
        """Get primary private IP address"""
        try:
            # Connect to a remote address to determine the local IP
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                s.connect(("8.8.8.8", 80))
                return s.getsockname()[0]
        except:
            return '127.0.0.1'

    def _get_aws_region(self):
        """Get AWS region from environment or metadata"""
        # Try environment variable first
        region = os.environ.get('AWS_REGION') or os.environ.get('AWS_DEFAULT_REGION')
        if region:
            return region
        
        # Try to get from EC2 metadata
        try:
            response = requests.get(
                "http://169.254.169.254/latest/meta-data/placement/region",
                timeout=2
            )
            return response.text
        except:
            return 'us-east-1'  # Default region

    def _get_platform_info(self):
        """Get platform information"""
        import platform
        
        return {
            'system': platform.system(),
            'release': platform.release(),
            'version': platform.version(),
            'machine': platform.machine(),
            'processor': platform.processor()
        }

    def get_dummy_metadata(self):
        """Get dummy metadata when real data is not available"""
        return {
            'environment': 'demo',
            'instance_id': 'i-1234567890abcdef0',
            'instance_type': 'm5.large',
            'region': 'us-west-2',
            'availability_zone': 'us-west-2a',
            'private_ip': '10.0.1.100',
            'public_ip': '54.123.45.67',
            'hostname': 'demo-instance',
            'platform': 'Demo EC2',
            'note': 'This is dummy data for demonstration purposes'
        }

    def get_dummy_deployment_info(self):
        """Get dummy deployment info"""
        return {
            'service_name': 'metadata-service',
            'version': '1.0.0',
            'environment': 'demo',
            'cloud_provider': 'AWS',
            'deployment_type': 'EC2',
            'start_time': datetime.utcnow().isoformat() + 'Z',
            'platform_info': {
                'system': 'Linux',
                'release': '5.4.0',
                'machine': 'x86_64'
            },
            'note': 'This is dummy deployment data'
        }