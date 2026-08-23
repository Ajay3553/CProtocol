import CryptoJS from 'crypto-js';
import NodeRSA from 'node-rsa';


// AES-256 SYMMETRIC ENCRYPTION (For Messages)
export const generateAESKey = () => {
    return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64);
};

export const encryptMessage = (message, aesKey) => {
    try {
        if (!message) return '';
        if (!aesKey) return message;
        const encrypted = CryptoJS.AES.encrypt(message, aesKey, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }).toString();
        return encrypted;
    } catch (error) {
        console.error('AES Encryption failed:', error);
        return message;
    }
};

export const decryptMessage = (encryptedMessage, aesKey) => {
    try {
        if (!encryptedMessage) return '';
        if (!aesKey) return encryptedMessage;
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, aesKey, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        // If decrypted is non-empty, return it; otherwise return original string
        return decrypted || encryptedMessage;
    } catch (error) {
        // Plaintext or decryption issue - gracefully return original content
        return encryptedMessage;
    }
};


// RSA ASYMMETRIC ENCRYPTION (For Key Exchange)
export const generateRSAKeyPair = () => {
    try {
        const key = new NodeRSA({ b: 2048 });
        key.setOptions({ encryptionScheme: 'pkcs1' });
        return {
            privateKey: key.exportKey('pkcs8-private'),
            publicKey: key.exportKey('pkcs8-public'),
        };
    } catch (error) {
        console.error('RSA Key generation failed:', error);
        return null;
    }
};

export const encryptAESKeyWithPublicKey = (aesKey, publicKeyPEM) => {
    try {
        if (!aesKey || !publicKeyPEM) return null;
        // Expects full PEM string
        const key = new NodeRSA(publicKeyPEM, 'pkcs8-public');
        key.setOptions({ encryptionScheme: 'pkcs1' });
        const encrypted = key.encrypt(aesKey, 'base64');
        return encrypted;
    } catch (error) {
        console.error('RSA Encryption failed:', error);
        return null;
    }
};

export const decryptAESKeyWithPrivateKey = (encryptedAESKey, privateKeyPEM) => {
    try {
        if (!encryptedAESKey || !privateKeyPEM) return null;
        const key = new NodeRSA(privateKeyPEM, 'pkcs8-private');
        key.setOptions({ encryptionScheme: 'pkcs1' });
        const decrypted = key.decrypt(encryptedAESKey, 'utf8');
        return decrypted;
    } catch (error) {
        console.error('RSA Decryption failed:', error);
        return null;
    }
};


// KEY MANAGEMENT
export const storeUserKeys = (userId, privateKey, publicKey) => {
    try {
        if (!userId) return false;
        // Store the full PEM strings as-is
        localStorage.setItem(`user_${userId}_private_key`, privateKey);
        localStorage.setItem(`user_${userId}_public_key`, publicKey);
        return true;
    } catch (error) {
        console.error('Failed to store keys:', error);
        return false;
    }
};

export const getUserKeys = (userId) => {
    try {
        if (!userId) return null;
        const privateKey = localStorage.getItem(`user_${userId}_private_key`);
        const publicKey = localStorage.getItem(`user_${userId}_public_key`);
        if (privateKey && publicKey) {
            return { privateKey, publicKey };
        }
        return null;
    } catch (error) {
        console.error('Failed to retrieve keys:', error);
        return null;
    }
};

export const storeChannelKey = (channelId, aesKey) => {
    try {
        if (!channelId || !aesKey) return false;
        sessionStorage.setItem(`channel_${channelId}_key`, aesKey);
        return true;
    } catch (error) {
        console.error('Failed to store channel key:', error);
        return false;
    }
};

export const getChannelKey = (channelId) => {
    try {
        if (!channelId) return null;
        return sessionStorage.getItem(`channel_${channelId}_key`);
    } catch (error) {
        console.error('Failed to retrieve channel key:', error);
        return null;
    }
};

export const removeChannelKey = (channelId) => {
    try {
        if (!channelId) return false;
        sessionStorage.removeItem(`channel_${channelId}_key`);
        return true;
    } catch (error) {
        console.error('Failed to remove channel key:', error);
        return false;
    }
};

export const loadAllChannelKeys = () => {
    const keys = {};
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('channel_') && key.endsWith('_key')) {
            const channelId = key.replace('channel_', '').replace('_key', '');
            const aesKey = sessionStorage.getItem(key);
            if (aesKey) keys[channelId] = aesKey;
        }
    }
    return keys;
};

// HIGH-LEVEL HELPERS
export const deriveFallbackAESKey = (channelId) => {
    if (!channelId) return generateAESKey();
    return CryptoJS.SHA256(`cprotocol_channel_key_${channelId}`).toString(CryptoJS.enc.Base64);
};

export const ensureUserKeyPair = (userId) => {
    if (!userId) return null;
    let keys = getUserKeys(userId);
    if (!keys || !keys.privateKey || !keys.publicKey) {
        const newKeyPair = generateRSAKeyPair();
        if (newKeyPair) {
            storeUserKeys(userId, newKeyPair.privateKey, newKeyPair.publicKey);
            keys = newKeyPair;
        }
    }
    return keys;
};

export const resolveChannelAESKey = (channel, userId) => {
    if (!channel) return null;
    const channelId = typeof channel === 'object' ? channel._id?.toString() : channel?.toString();
    if (!channelId) return null;

    // 1. Check if already present in session cache
    let cachedKey = getChannelKey(channelId);
    if (cachedKey) return cachedKey;

    // 2. Try to decrypt from channel participants if channel is an object
    if (typeof channel === 'object' && Array.isArray(channel.participants) && userId) {
        const myParticipant = channel.participants.find(
            (p) => (p.user?._id || p.user)?.toString() === userId.toString()
        );

        if (myParticipant?.encryptedKey) {
            const userKeys = getUserKeys(userId);
            if (userKeys?.privateKey) {
                const decryptedAESKey = decryptAESKeyWithPrivateKey(myParticipant.encryptedKey, userKeys.privateKey);
                if (decryptedAESKey) {
                    storeChannelKey(channelId, decryptedAESKey);
                    return decryptedAESKey;
                }
            }
        }
    }

    // 3. Fallback deterministic key derivation for legacy channels
    const fallbackKey = deriveFallbackAESKey(channelId);
    storeChannelKey(channelId, fallbackKey);
    return fallbackKey;
};

export const decryptSingleMessage = (msg, aesKey) => {
    if (!msg) return msg;
    if (typeof msg.content !== 'string' || !msg.content) return msg;
    const decrypted = decryptMessage(msg.content, aesKey);
    return {
        ...msg,
        content: decrypted
    };
};

export const decryptMessagesList = (messages, aesKey) => {
    if (!Array.isArray(messages)) return [];
    if (!aesKey) return messages;
    return messages.map((m) => decryptSingleMessage(m, aesKey));
};