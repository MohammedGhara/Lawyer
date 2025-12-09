/**
 * WhatsApp Service - Free WhatsApp Integration
 * Uses whatsapp-web.js to connect to WhatsApp Web and save conversations
 * 
 * Installation: npm install whatsapp-web.js qrcode-terminal axios
 * Run: npm run whatsapp
 */

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const config = require('./config');
const { normalizePhone } = require('./utils');

const DJANGO_API_URL = config.DJANGO_API_URL;
const LAWYER_PHONE = config.LAWYER_PHONE;

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: path.join(__dirname, '.wwebjs_auth')
    }),
    puppeteer: {
        ...config.PUPPETEER_OPTIONS,
        timeout: 60000, // Increase timeout
    },
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2413.51-beta.html',
    }
});

// Check if authentication already exists
const authPath = path.join(__dirname, '.wwebjs_auth');
let authExists = false;
try {
    authExists = fs.existsSync(authPath) && fs.readdirSync(authPath).length > 0;
} catch (err) {
    authExists = false;
}

let qrShown = false;

if (authExists) {
    console.log('🔐 Found saved authentication. Attempting to reuse session...');
    console.log('   If session is valid, no QR code will be shown.');
} else {
    console.log('🔑 No saved authentication found. QR code will be shown.');
}

// QR Code for authentication
client.on('qr', (qr) => {
    if (!qrShown) {
        qrShown = true;
        if (authExists) {
            console.log('\n⚠️  Saved session expired or invalid. New QR code required:');
        } else {
            console.log('\n📱 Scan this QR code with WhatsApp (one-time setup):');
        }
        qrcode.generate(qr, { small: true });
        console.log('\nScan the QR code above with your WhatsApp mobile app');
        if (!authExists) {
            console.log('💡 After scanning, authentication will be saved automatically.');
            console.log('   Next time you run this, no QR code will be needed!');
        }
    }
});

// Ready event
client.on('ready', () => {
    console.log('\n✅ WhatsApp client is ready!');
    console.log('📞 Listening for messages...');
    if (!qrShown) {
        console.log('💾 Using saved authentication - no QR code needed!');
    } else {
        console.log('💾 Authentication saved. Next time you run this, no QR code needed!');
    }
});

// Authentication events
client.on('authenticated', () => {
    console.log('✅ Authenticated successfully');
    console.log('💾 Saving authentication for future use...');
});

client.on('auth_failure', async (msg) => {
    console.error('❌ Authentication failed:', msg);
    console.log('🔄 Clearing session and requesting new QR code...');
    await clearSession();
    // Client will automatically request new QR code
});

client.on('disconnected', async (reason) => {
    console.log(`\n⚠️  WhatsApp disconnected: ${reason}`);
    console.log('🔄 Clearing session and reconnecting...');
    await clearSession();
    console.log('📱 Reinitializing - new QR code will appear in 2 seconds...');
    
    // Wait a bit then reinitialize
    setTimeout(async () => {
        try {
            await client.initialize();
            console.log('✅ Reinitialization started. Scan the QR code when it appears.');
        } catch (err) {
            console.error('❌ Reconnection failed:', err.message);
            console.log('💡 Please restart manually: npm run whatsapp');
        }
    }, 2000);
});

// Function to clear session folder
async function clearSession() {
    const authPath = path.join(__dirname, '.wwebjs_auth');
    if (!fs.existsSync(authPath)) {
        return;
    }
    
    try {
        // Wait for any file handles to close
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Try using fs.rmSync first (Node.js 14.14.0+)
        if (fs.rmSync) {
            try {
                fs.rmSync(authPath, { 
                    recursive: true, 
                    force: true, 
                    maxRetries: 5, 
                    retryDelay: 500 
                });
                console.log('✅ Session cleared successfully');
                return;
            } catch (rmErr) {
                // If rmSync fails, try manual deletion
            }
        }
        
        // Fallback: Manual recursive deletion
        const deleteRecursive = (dir) => {
            if (!fs.existsSync(dir)) return;
            
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const curPath = path.join(dir, file);
                try {
                    const stat = fs.lstatSync(curPath);
                    if (stat.isDirectory()) {
                        deleteRecursive(curPath);
                        try {
                            fs.rmdirSync(curPath);
                        } catch (e) {
                            // Directory might not be empty, continue
                        }
                    } else {
                        try {
                            fs.unlinkSync(curPath);
                        } catch (e) {
                            // File might be locked, continue with others
                        }
                    }
                } catch (err) {
                    // Continue with other files
                }
            }
        };
        
        deleteRecursive(authPath);
        
        // Try to remove the main directory
        try {
            fs.rmdirSync(authPath);
            console.log('✅ Session cleared successfully');
        } catch (err) {
            console.log('⚠️  Session mostly cleared (some locked files may remain, will be cleaned on restart)');
        }
    } catch (err) {
        console.log('⚠️  Session cleanup had issues, but continuing...');
    }
}

// Listen for incoming messages
client.on('message', async (message) => {
    try {
        // Skip status updates, group messages, and system messages
        if (message.from === 'status@broadcast' || 
            message.from?.includes('@g.us') || 
            message.from?.includes('status@broadcast') ||
            message.isStatus ||
            message.isGroupMsg) {
            return; // Silently ignore these messages
        }
        
        // Get phone number directly from message (more reliable)
        let fromNumber = '';
        if (message.from) {
            fromNumber = message.from.includes('@') ? message.from.split('@')[0] : message.from;
        } else if (message.author) {
            fromNumber = message.author.split('@')[0];
        } else if (message.fromNumber) {
            fromNumber = message.fromNumber;
        }
        
        if (!fromNumber || fromNumber === 'status' || fromNumber === 'broadcast') {
            return; // Skip invalid or system messages
        }
        
        const messageText = message.body || message.caption || '(no text)';
        const messageId = message.id?._serialized || message.id || `recv_${Date.now()}_${Math.random()}`;
        const timestamp = message.timestamp ? new Date(message.timestamp * 1000) : new Date();
        
        // Skip if message is empty and has no media
        if ((!messageText || messageText.trim() === '') && !message.hasMedia) {
            return; // Skip empty messages
        }
        
        // Get case by phone number
        try {
            const casesResponse = await axios.get(`${DJANGO_API_URL}/cases/list/`);
            const cases = casesResponse.data;
            
            // Find case by phone number (normalize phone numbers for comparison)
            const matchingCase = cases.find(c => {
                const casePhone = normalizePhone(c.phone);
                const messagePhone = normalizePhone(fromNumber);
                return casePhone === messagePhone;
            });
            
            if (matchingCase) {
                // Determine if message is from lawyer or client
                const lawyerPhoneNormalized = normalizePhone(LAWYER_PHONE);
                const fromPhoneNormalized = normalizePhone(fromNumber);
                const isFromLawyer = lawyerPhoneNormalized && fromPhoneNormalized === lawyerPhoneNormalized;
                
                // Prepare message data
                const messageData = {
                    case_id: matchingCase.id,
                    message_id: messageId || `recv_${Date.now()}_${Math.random()}`,
                    from_number: fromNumber || 'unknown',
                    to_number: isFromLawyer ? matchingCase.phone : (LAWYER_PHONE || 'unknown'),
                    message_text: messageText || '(empty message)',
                    is_from_lawyer: isFromLawyer,
                    timestamp: timestamp.toISOString(),
                    message_type: message.type || 'text',
                    has_media: message.hasMedia || false,
                    media_url: message.hasMedia ? null : null // Can be enhanced to download media
                };
                
                try {
                    const response = await axios.post(`${DJANGO_API_URL}/whatsapp/messages/`, messageData);
                    console.log(`💾 Saved message from ${matchingCase.client_name}: ${messageText.substring(0, 50)}...`);
                } catch (apiError) {
                    if (apiError.response) {
                        console.error(`❌ Error saving message (${apiError.response.status}):`, apiError.response.data);
                        console.error('   Message data:', JSON.stringify(messageData, null, 2));
                    } else {
                        console.error('❌ Error saving message:', apiError.message);
                    }
                }
            }
            // Silently ignore messages from unknown numbers (not in our cases)
        } catch (error) {
            console.error('❌ Error saving message:', error.message);
        }
    } catch (error) {
        console.error('❌ Error processing message:', error);
    }
});

// Handle message creation (when lawyer sends a message)
client.on('message_create', async (message) => {
    // This fires for sent messages too
    if (message.fromMe) {
        // Skip status updates, group messages, and system messages
        if (message.to === 'status@broadcast' || 
            message.to?.includes('@g.us') || 
            message.to?.includes('status@broadcast') ||
            message.isStatus ||
            message.isGroupMsg ||
            !message.to) {
            return; // Silently ignore these messages
        }
        
        try {
            // Get phone number directly from message (avoid getContact() which fails with new WhatsApp Web)
            let toNumber = '';
            if (message.to) {
                toNumber = message.to.includes('@') ? message.to.split('@')[0] : message.to;
            } else if (message.id?.remote) {
                toNumber = message.id.remote.split('@')[0];
            } else if (message.toNumber) {
                toNumber = message.toNumber;
            } else {
                // Try to extract from message ID
                const msgId = message.id?._serialized || message.id;
                if (msgId && msgId.includes('@')) {
                    const parts = msgId.split('@');
                    if (parts.length > 1) {
                        toNumber = parts[0];
                    }
                }
            }
            
            if (!toNumber || toNumber === 'status' || toNumber === 'broadcast') {
                return; // Skip invalid or system messages
            }
            
            const messageText = message.body || message.caption || '(no text)';
            const messageId = message.id?._serialized || message.id || `sent_${Date.now()}_${Math.random()}`;
            const timestamp = message.timestamp ? new Date(message.timestamp * 1000) : new Date();
            
            // Skip if message is empty and has no media
            if (!messageText || messageText.trim() === '' && !message.hasMedia) {
                return; // Skip empty messages
            }
            
            // Find case by phone number
            try {
                const casesResponse = await axios.get(`${DJANGO_API_URL}/cases/list/`);
                const cases = casesResponse.data;
                
                const matchingCase = cases.find(c => {
                    const casePhone = normalizePhone(c.phone);
                    const messagePhone = normalizePhone(toNumber);
                    return casePhone === messagePhone;
                });
                
                if (matchingCase) {
                    // Prepare message data
                    const messageData = {
                        case_id: matchingCase.id,
                        message_id: messageId || `sent_${Date.now()}_${Math.random()}`,
                        from_number: LAWYER_PHONE || 'unknown',
                        to_number: toNumber || 'unknown',
                        message_text: messageText || '(empty message)',
                        is_from_lawyer: true,
                        timestamp: timestamp.toISOString(),
                        message_type: message.type || 'text',
                        has_media: message.hasMedia || false
                    };
                    
                    try {
                        const response = await axios.post(`${DJANGO_API_URL}/whatsapp/messages/`, messageData);
                        console.log(`💾 Saved sent message to ${matchingCase.client_name}: ${messageText.substring(0, 50)}...`);
                    } catch (apiError) {
                        if (apiError.response) {
                            console.error(`❌ Error saving sent message (${apiError.response.status}):`, apiError.response.data);
                            console.error('   Message data:', JSON.stringify(messageData, null, 2));
                        } else {
                            console.error('❌ Error saving sent message:', apiError.message);
                        }
                    }
                }
            } catch (error) {
                console.error('❌ Error processing sent message:', error.message);
            }
        } catch (error) {
            console.error('❌ Error processing sent message:', error);
        }
    }
});

// Start the client
console.log('🚀 Starting WhatsApp service...');
console.log(`📁 Authentication data path: ${authPath}`);
console.log(`🔐 Saved session exists: ${authExists ? 'Yes' : 'No'}`);

client.initialize().catch(async (err) => {
    console.error('❌ Failed to initialize WhatsApp client:', err.message);
    
    // If session is corrupted or disconnected, clear it and retry
    if (err.message.includes('Execution context was destroyed') || 
        err.message.includes('navigation') ||
        err.message.includes('Session') ||
        err.message.includes('disconnected')) {
        console.log('\n🔄 Session appears corrupted or disconnected. Clearing and requesting new QR code...');
        await clearSession();
        
        // Wait a moment then retry
        console.log('⏳ Retrying in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
            console.log('🔄 Reinitializing client...');
            await client.initialize();
        } catch (retryErr) {
            console.error('❌ Retry failed:', retryErr.message);
            console.log('💡 Please restart the service: npm run whatsapp');
            process.exit(1);
        }
    } else {
        console.error('❌ Unexpected error. Please restart the service.');
        process.exit(1);
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down WhatsApp service...');
    await client.destroy();
    process.exit(0);
});

