const express = require('express');
const router = express.Router();
const os = require('os');
const package = require('../package.json');

// Health check endpoint
router.get('/health', (req, res) => {
    const healthCheck = {
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: {
            name: 'notification-service',
            version: package.version,
            description: package.description
        },
        system: {
            uptime: process.uptime(),
            memory: {
                used: process.memoryUsage(),
                system: {
                    free: os.freemem(),
                    total: os.totalmem()
                }
            },
            cpu: {
                usage: process.cpuUsage(),
                cores: os.cpus().length
            }
        },
        dependencies: {
            email: {
                status: process.env.MAIL_HOST ? 'CONFIGURED' : 'NOT_CONFIGURED',
                host: process.env.MAIL_HOST || 'N/A'
            }
        }
    };

    res.status(200).json(healthCheck);
});

// Detailed health check
router.get('/info', (req, res) => {
    res.json({
        app: {
            name: package.name,
            version: package.version,
            description: package.description,
            author: package.author,
            license: package.license
        },
        build: {
            timestamp: new Date().toISOString(),
            node: process.version,
            platform: process.platform,
            arch: process.arch
        },
        git: {
            branch: process.env.GIT_BRANCH || 'unknown',
            commit: process.env.GIT_COMMIT || 'unknown'
        }
    });
});

// Readiness probe
router.get('/ready', (req, res) => {
    // Check if service is ready to accept traffic
    const isReady = true; // Add your readiness checks here
    
    if (isReady) {
        res.status(200).json({ status: 'READY' });
    } else {
        res.status(503).json({ status: 'NOT_READY' });
    }
});

// Liveness probe
router.get('/live', (req, res) => {
    res.status(200).json({ status: 'ALIVE' });
});

module.exports = router;