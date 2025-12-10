/**
 * WhatsApp Utility Functions
 */

/**
 * Normalize phone number for comparison
 * Removes country codes, leading zeros, and non-digit characters
 * @param {string} phone - Phone number to normalize
 * @returns {string} Normalized phone number
 */
function normalizePhone(phone) {
    if (!phone) return '';
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    // Remove leading 0 or country code
    if (cleaned.startsWith('972')) {
        cleaned = cleaned.substring(3);
    }
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }
    return cleaned;
}

/**
 * Format phone number for WhatsApp URL
 * @param {string} phone - Phone number
 * @returns {string} Formatted for WhatsApp (972XXXXXXXXX)
 */
function formatPhoneForWhatsApp(phone) {
    const normalized = normalizePhone(phone);
    return `972${normalized}`;
}

/**
 * Check if two phone numbers match (after normalization)
 * @param {string} phone1 - First phone number
 * @param {string} phone2 - Second phone number
 * @returns {boolean} True if numbers match
 */
function phonesMatch(phone1, phone2) {
    return normalizePhone(phone1) === normalizePhone(phone2);
}

module.exports = {
    normalizePhone,
    formatPhoneForWhatsApp,
    phonesMatch
};

