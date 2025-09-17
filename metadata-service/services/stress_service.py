import psutil
import threading
import time
import multiprocessing
import os
from utils.logger import setup_logger

logger = setup_logger(__name__)

class StressService:
    def __init__(self):
        self.stress_threads = []
        self.stress_active = False
        
    def start_stress(self, stress_type, duration):
        """Start stress test"""
        try:
            logger.info(f"Starting {stress_type} stress test for {duration} seconds")
            self.stress_active = True
            
            if stress_type == 'cpu':
                self._start_cpu_stress(duration)
            elif stress_type == 'memory':
                self._start_memory_stress(duration)
            elif stress_type == 'mixed':
                self._start_mixed_stress(duration)
            else:
                raise ValueError(f"Unknown stress type: {stress_type}")
                
        except Exception as e:
            logger.error(f"Error starting stress test: {str(e)}")
            self.stress_active = False
            raise
    
    def _start_cpu_stress(self, duration):
        """Start CPU stress test"""
        num_cores = multiprocessing.cpu_count()
        
        def cpu_stress_worker():
            end_time = time.time() + duration
            while time.time() < end_time and self.stress_active:
                # Busy wait to consume CPU
                for _ in range(10000):
                    pass
        
        # Start one thread per CPU core
        for _ in range(num_cores):
            thread = threading.Thread(target=cpu_stress_worker)
            thread.daemon = True
            thread.start()
            self.stress_threads.append(thread)
        
        # Wait for completion
        time.sleep(duration)
        self.stress_active = False
        logger.info("CPU stress test completed")
    
    def _start_memory_stress(self, duration):
        """Start memory stress test"""
        def memory_stress_worker():
            memory_blocks = []
            end_time = time.time() + duration
            
            try:
                while time.time() < end_time and self.stress_active:
                    # Allocate 100MB blocks
                    block = bytearray(100 * 1024 * 1024)  # 100MB
                    memory_blocks.append(block)
                    time.sleep(1)  # Pause between allocations
                    
                    # Prevent unlimited memory growth
                    if len(memory_blocks) > 20:  # Limit to ~2GB
                        memory_blocks.pop(0)
            except MemoryError:
                logger.warning("Memory stress test hit memory limit")
            finally:
                # Clean up
                memory_blocks.clear()
        
        thread = threading.Thread(target=memory_stress_worker)
        thread.daemon = True
        thread.start()
        self.stress_threads.append(thread)
        
        time.sleep(duration)
        self.stress_active = False
        logger.info("Memory stress test completed")
    
    def _start_mixed_stress(self, duration):
        """Start mixed CPU and memory stress test"""
        # Start CPU stress (lighter load)
        num_cores = max(1, multiprocessing.cpu_count() // 2)
        
        def cpu_stress_worker():
            end_time = time.time() + duration
            while time.time() < end_time and self.stress_active:
                for _ in range(5000):  # Less intensive than pure CPU stress
                    pass
                time.sleep(0.01)  # Small break
        
        def memory_stress_worker():
            memory_blocks = []
            end_time = time.time() + duration
            
            try:
                while time.time() < end_time and self.stress_active:
                    block = bytearray(50 * 1024 * 1024)  # 50MB blocks
                    memory_blocks.append(block)
                    time.sleep(2)  # Slower allocation
                    
                    if len(memory_blocks) > 10:  # Limit to ~500MB
                        memory_blocks.pop(0)
            except MemoryError:
                logger.warning("Mixed stress test hit memory limit")
            finally:
                memory_blocks.clear()
        
        # Start CPU stress threads
        for _ in range(num_cores):
            thread = threading.Thread(target=cpu_stress_worker)
            thread.daemon = True
            thread.start()
            self.stress_threads.append(thread)
        
        # Start memory stress thread
        thread = threading.Thread(target=memory_stress_worker)
        thread.daemon = True
        thread.start()
        self.stress_threads.append(thread)
        
        time.sleep(duration)
        self.stress_active = False
        logger.info("Mixed stress test completed")
    
    def stop_stress(self):
        """Stop all stress tests"""
        logger.info("Stopping stress tests")
        self.stress_active = False
        
        # Wait for threads to complete
        for thread in self.stress_threads:
            if thread.is_alive():
                thread.join(timeout=1)
        
        self.stress_threads.clear()
    
    def get_current_metrics(self):
        """Get current system metrics"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            
            # Get load average (Unix systems)
            load_avg = None
            if hasattr(os, 'getloadavg'):
                load_avg = list(os.getloadavg())
            
            return {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'memory_used_gb': round(memory.used / (1024**3), 2),
                'memory_available_gb': round(memory.available / (1024**3), 2),
                'load_average': load_avg,
                'active_stress': self.stress_active
            }
            
        except Exception as e:
            logger.error(f"Error getting current metrics: {str(e)}")
            return {
                'cpu_percent': 0,
                'memory_percent': 0,
                'memory_used_gb': 0,
                'memory_available_gb': 0,
                'load_average': None,
                'active_stress': False,
                'error': str(e)
            }