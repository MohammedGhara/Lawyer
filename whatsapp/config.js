/**
 * WhatsApp Service Configuration
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', 'server', '.env') });

const config = {
    DJANGO_API_URL: process.env.DJANGO_API_URL || 'http://127.0.0.1:8000/api',
    LAWYER_PHONE: process.env.LAWYER_PHONE || '',
    AUTH_DATA_PATH: '.wwebjs_auth',
    PUPPETEER_OPTIONS: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
};

// Validation
if (!config.LAWYER_PHONE) {
    console.warn('⚠️  WARNING: LAWYER_PHONE not set in .env file');
    console.warn('   Set it in server/.env: LAWYER_PHONE=0501234567');
}

module.exports = config;

