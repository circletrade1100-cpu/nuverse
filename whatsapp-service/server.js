import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { create, ev } from '@open-wa/wa-automate';
import multer from 'multer';
import QRCode from 'qrcode';
import winston from 'winston';

// Load environment variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'whatsapp-service' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Global variables
let client = null;
let qrCodeData = null;
let connectionStatus = {
    connected: false,
    phone_number: null,
    last_connected: null
};

// Initialize WhatsApp client
async function initializeWhatsApp() {
    try {
        logger.info('Initializing WhatsApp client...');
        
        client = await create({
            sessionId: process.env.WHATSAPP_SESSION_ID || "ANNUR_WA_SESSION",
            multiDevice: false,
            authTimeout: 120,
            blockCrashLogs: true,
            disableSpins: true,
            headless: true,
            qrTimeout: 0,
            restartOnCrash: true,
            cacheEnabled: false,
            sessionDataPath: '/tmp/whatsapp-sessions',
            chromiumArgs: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        logger.info('WhatsApp client initialized successfully');

        // Event handlers
        client.onStateChanged((state) => {
            logger.info('WhatsApp state changed:', state);
            handleStateChange(state);
        });

        client.onQR((qr) => {
            logger.info('QR code received');
            qrCodeData = qr;
        });

        client.onMessage(async (message) => {
            logger.info('New message received:', message.from);
        });

        // Check if already connected
        const isConnected = await client.isConnected();
        if (isConnected) {
            const info = await client.getHostDevice();
            connectionStatus = {
                connected: true,
                phone_number: info.wid.user,
                last_connected: new Date().toISOString()
            };
            logger.info('WhatsApp already connected:', connectionStatus.phone_number);
        }

    } catch (error) {
        logger.error('Failed to initialize WhatsApp client:', error);
    }
}

// Handle state changes
function handleStateChange(state) {
    switch (state) {
        case 'CONNECTED':
            connectionStatus = {
                connected: true,
                phone_number: null, // Will be updated when we get device info
                last_connected: new Date().toISOString()
            };
            logger.info('WhatsApp connected');
            break;
        case 'UNPAIRED':
        case 'UNPAIRED_IDLE':
            connectionStatus = {
                connected: false,
                phone_number: null,
                last_connected: null
            };
            qrCodeData = null;
            logger.info('WhatsApp disconnected');
            break;
        default:
            logger.info('WhatsApp state:', state);
    }
}

// API Routes

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        whatsapp_connected: connectionStatus.connected
    });
});

// Get connection status
app.get('/api/wa/status', (req, res) => {
    res.json({
        success: true,
        data: {
            connected: connectionStatus.connected,
            phone_number: connectionStatus.phone_number,
            last_connected: connectionStatus.last_connected
        }
    });
});

// Connect WhatsApp (generate QR)
app.post('/api/wa/connect', async (req, res) => {
    try {
        if (connectionStatus.connected) {
            return res.json({
                success: true,
                message: 'Already connected',
                data: {
                    connected: true,
                    phone_number: connectionStatus.phone_number
                }
            });
        }

        // If QR code is available, return it immediately
        if (qrCodeData) {
            const qrCodeBase64 = await QRCode.toDataURL(qrCodeData);
            return res.json({
                success: true,
                message: 'QR code available',
                data: {
                    qr_code: qrCodeBase64,
                    status: 'waiting_for_scan'
                }
            });
        }

        // If client doesn't exist, it's still initializing
        if (!client) {
            return res.status(503).json({
                success: false,
                message: 'WhatsApp client is initializing. Please wait a moment and try again.'
            });
        }

        // Client exists but no QR code yet
        return res.status(503).json({
            success: false,
            message: 'Waiting for QR code generation. Please try again in a few seconds.'
        });

    } catch (error) {
        logger.error('Connect error:', error);
        res.status(500).json({
            success: false,
            message: 'Connection error: ' + error.message
        });
    }
});

// Disconnect WhatsApp
app.post('/api/wa/disconnect', async (req, res) => {
    try {
        if (client) {
            await client.kill();
            client = null;
        }
        
        connectionStatus = {
            connected: false,
            phone_number: null,
            last_connected: null
        };
        qrCodeData = null;

        logger.info('WhatsApp disconnected');
        res.json({
            success: true,
            message: 'WhatsApp disconnected successfully'
        });

    } catch (error) {
        logger.error('Disconnect error:', error);
        res.status(500).json({
            success: false,
            message: 'Disconnect error: ' + error.message
        });
    }
});

// Get QR code
app.get('/api/wa/qr-code', (req, res) => {
    if (qrCodeData) {
        res.json({
            success: true,
            data: {
                qr_code: qrCodeData
            }
        });
    } else {
        res.json({
            success: false,
            message: 'No QR code available'
        });
    }
});

// Send text message
app.post('/api/wa/send-message', async (req, res) => {
    try {
        if (!client || !connectionStatus.connected) {
            return res.status(400).json({
                success: false,
                message: 'WhatsApp not connected'
            });
        }

        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({
                success: false,
                message: 'Phone and message are required'
            });
        }

        // Format phone number
        const formattedPhone = phone.replace(/[^0-9]/g, '');
        const chatId = formattedPhone + '@c.us';

        // Send message
        await client.sendText(chatId, message);

        logger.info('Message sent to:', phone);
        res.json({
            success: true,
            message: 'Message sent successfully',
            data: {
                phone: phone,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        logger.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message: ' + error.message
        });
    }
});

// Send media message
app.post('/api/wa/send-media', upload.single('file'), async (req, res) => {
    try {
        if (!client || !connectionStatus.connected) {
            return res.status(400).json({
                success: false,
                message: 'WhatsApp not connected'
            });
        }

        const { phone, caption } = req.body;
        const file = req.file;

        if (!phone || !file) {
            return res.status(400).json({
                success: false,
                message: 'Phone and file are required'
            });
        }

        // Format phone number
        const formattedPhone = phone.replace(/[^0-9]/g, '');
        const chatId = formattedPhone + '@c.us';

        // Send media
        await client.sendFile(chatId, file.path, file.filename, caption || '');

        logger.info('Media sent to:', phone);
        res.json({
            success: true,
            message: 'Media sent successfully',
            data: {
                phone: phone,
                filename: file.filename,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        logger.error('Send media error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send media: ' + error.message
        });
    }
});

// Get device info
app.get('/api/wa/device-info', async (req, res) => {
    try {
        if (!client || !connectionStatus.connected) {
            return res.status(400).json({
                success: false,
                message: 'WhatsApp not connected'
            });
        }

        const deviceInfo = await client.getHostDevice();
        
        res.json({
            success: true,
            data: {
                phone_number: deviceInfo.wid.user,
                name: deviceInfo.pushname,
                platform: deviceInfo.platform,
                battery: deviceInfo.battery
            }
        });

    } catch (error) {
        logger.error('Get device info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get device info: ' + error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    logger.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    logger.info(`WhatsApp service running on port ${PORT}`);
    logger.info('Initializing WhatsApp client...');
    
    // Initialize WhatsApp client on startup
    initializeWhatsApp().catch(err => {
        logger.error('Failed to initialize WhatsApp on startup:', err);
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Shutting down WhatsApp service...');
    
    if (client) {
        await client.kill();
    }
    
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('Shutting down WhatsApp service...');
    
    if (client) {
        await client.kill();
    }
    
    process.exit(0);
});

export default app;
