from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
import os
from datetime import datetime
import threading
import time

from services.metadata_service import MetadataService
from services.stress_service import StressService
from services.environment_detector import EnvironmentDetector
from utils.logger import setup_logger
from config.settings import Config

# 🔹 Prometheus imports
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

app = Flask(__name__)
CORS(app)

# Setup logging
logger = setup_logger(__name__)

# Initialize services
metadata_service = MetadataService()
stress_service = StressService()
env_detector = EnvironmentDetector()

# 🔹 Prometheus metrics
http_requests_total = Counter(
    "metadata_http_requests_total",
    "Total HTTP requests for metadata service",
    ["method", "path", "status"]
)

http_request_duration_seconds = Histogram(
    "metadata_http_request_duration_seconds",
    "HTTP request latency for metadata service",
    ["method", "path"]
)

@app.before_request
def before_request():
    request.start_time = time.time()

@app.after_request
def after_request(response):
    try:
        duration = time.time() - request.start_time
        http_requests_total.labels(
            method=request.method,
            path=request.path,
            status=response.status_code
        ).inc()
        http_request_duration_seconds.labels(
            method=request.method,
            path=request.path
        ).observe(duration)
    except Exception:
        pass
    return response

# 🔹 Prometheus metrics endpoint
@app.route('/metrics', methods=['GET'])
def metrics():
    return generate_latest(), 200, {"Content-Type": CONTENT_TYPE_LATEST}

# Global stress test state
stress_state = {
    'active': False,
    'start_time': None,
    'duration': 0,
    'type': None
}

@app.route('/api/metadata/health', methods=['GET'])
def health_check():
    try:
        system_info = metadata_service.get_system_info()
        return jsonify({
            'status': 'UP',
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'service': {
                'name': 'metadata-service',
                'version': '1.0.0',
                'environment': env_detector.detect_environment()
            },
            'system': system_info
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({'status': 'DOWN', 'error': str(e)}), 500

@app.route('/api/metadata/instance', methods=['GET'])
def get_instance_metadata():
    try:
        logger.info("Fetching instance metadata")
        metadata = metadata_service.get_instance_metadata()
        return jsonify({
            'success': True,
            'data': metadata,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }), 200
    except Exception as e:
        logger.error(f"Error fetching instance metadata: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'data': metadata_service.get_dummy_metadata()
        }), 200

@app.route('/api/metadata/deployment', methods=['GET'])
def get_deployment_info():
    try:
        logger.info("Fetching deployment information")
        deployment_info = metadata_service.get_deployment_info()
        return jsonify({
            'success': True,
            'data': deployment_info,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }), 200
    except Exception as e:
        logger.error(f"Error fetching deployment info: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'data': metadata_service.get_dummy_deployment_info()
        }), 200

@app.route('/api/metadata/network', methods=['GET'])
def get_network_info():
    try:
        logger.info("Fetching network information")
        network_info = metadata_service.get_network_info()
        return jsonify({
            'success': True,
            'data': network_info,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }), 200
    except Exception as e:
        logger.error(f"Error fetching network info: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/stress/start', methods=['POST'])
def start_stress_test():
    try:
        global stress_state
        data = request.get_json()
        duration = data.get('duration', 300)
        stress_type = data.get('type', 'cpu')

        if stress_state['active']:
            return jsonify({'success': False, 'message': 'Stress test already running'}), 400

        logger.info(f"Starting {stress_type} stress test for {duration} seconds")

        def run_stress():
            global stress_state
            stress_state = {
                'active': True,
                'start_time': datetime.utcnow(),
                'duration': duration,
                'type': stress_type
            }
            stress_service.start_stress(stress_type, duration)
            stress_state = {
                'active': False,
                'start_time': None,
                'duration': 0,
                'type': None
            }

        thread = threading.Thread(target=run_stress, daemon=True)
        thread.start()

        return jsonify({
            'success': True,
            'message': f'{stress_type.title()} stress test started',
            'duration_seconds': duration,
            'stress_type': stress_type
        }), 200
    except Exception as e:
        logger.error(f"Error starting stress test: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/stress/status', methods=['GET'])
def get_stress_status():
    try:
        current_metrics = stress_service.get_current_metrics()
        stress_info = {
            'active': stress_state['active'],
            'metrics': current_metrics
        }
        if stress_state['active']:
            elapsed = (datetime.utcnow() - stress_state['start_time']).total_seconds()
            remaining = max(0, stress_state['duration'] - elapsed)
            stress_info.update({
                'start_time': stress_state['start_time'].isoformat() + 'Z',
                'duration': stress_state['duration'],
                'elapsed_seconds': int(elapsed),
                'remaining_seconds': int(remaining),
                'type': stress_state['type']
            })
        return jsonify({'success': True, 'data': stress_info}), 200
    except Exception as e:
        logger.error(f"Error getting stress status: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/stress/stop', methods=['POST'])
def stop_stress_test():
    global stress_state
    try:
        if not stress_state['active']:
            return jsonify({'success': False, 'message': 'No active stress test to stop'}), 400

        stress_service.stop_stress()
        stress_state = {
            'active': False,
            'start_time': None,
            'duration': 0,
            'type': None
        }
        logger.info("Stress test stopped manually")
        return jsonify({'success': True, 'message': 'Stress test stopped'}), 200
    except Exception as e:
        logger.error(f"Error stopping stress test: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found', 'path': request.path}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('METADATA_SERVICE_PORT', 8084))
    debug = os.environ.get('FLASK_ENV') == 'development'
    logger.info(f"Starting Metadata Service on port {port}")
    logger.info(f"Environment: {env_detector.detect_environment()}")
    app.run(host='0.0.0.0', port=port, debug=debug)
