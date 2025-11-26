// End-to-End Encryption using TweetNaCl
import nacl from 'tweetnacl';
import { decodeBase64, encodeBase64, decodeUTF8, encodeUTF8 } from 'tweetnacl-util';

// Generate key pair for user (called once on signup)
export const generateKeyPair = () => {
  return nacl.box.keyPair();
};

// Get public key string from keypair
export const getPublicKey = (keyPair: nacl.BoxKeyPair): string => {
  return encodeBase64(keyPair.publicKey);
};

// Get private key string from keypair
export const getPrivateKey = (keyPair: nacl.BoxKeyPair): string => {
  return encodeBase64(keyPair.secretKey);
};

// Parse public key from string
export const parsePublicKey = (publicKeyStr: string): Uint8Array => {
  return decodeBase64(publicKeyStr);
};

// Parse private key from string
export const parsePrivateKey = (privateKeyStr: string): Uint8Array => {
  return decodeBase64(privateKeyStr);
};

// Encrypt message using recipient's public key (Box encryption)
// Returns: { encrypted, nonce, ephemeralPublicKey }
export const encryptMessage = (
  message: string,
  recipientPublicKey: string,
  _senderPrivateKey?: string // Not used in Box encryption but kept for API compatibility
): { encrypted: string; nonce: string; ephemeralPublicKey: string } => {
  try {
    const recipientPubKey = parsePublicKey(recipientPublicKey);
    
    // Generate ephemeral key pair for this message
    const ephemeralKeyPair = nacl.box.keyPair();
    
    // Generate nonce (random 24 bytes)
    const nonce = nacl.randomBytes(24);
    
    // Encrypt message (box requires ephemeral key pair, not sender's private key)
    const messageBytes = decodeUTF8(message);
    const encrypted = nacl.box(
      messageBytes,
      nonce,
      recipientPubKey,
      ephemeralKeyPair.secretKey
    );
    
    return {
      encrypted: encodeBase64(encrypted),
      nonce: encodeBase64(nonce),
      ephemeralPublicKey: encodeBase64(ephemeralKeyPair.publicKey),
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
};

// Decrypt message using private key
export const decryptMessage = (
  encryptedData: { encrypted: string; nonce: string; ephemeralPublicKey: string },
  recipientPrivateKey: string
): string => {
  try {
    const recipientPrivKey = parsePrivateKey(recipientPrivateKey);
    const encrypted = decodeBase64(encryptedData.encrypted);
    const nonce = decodeBase64(encryptedData.nonce);
    const ephemeralPubKey = parsePublicKey(encryptedData.ephemeralPublicKey);
    
    // Decrypt message
    const decrypted = nacl.box.open(
      encrypted,
      nonce,
      ephemeralPubKey,
      recipientPrivKey
    );
    
    if (!decrypted) {
      throw new Error('Decryption failed');
    }
    
    return encodeUTF8(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Decryption failed]';
  }
};

// Generate random key for group encryption (Secretbox)
export const generateGroupKey = (): Uint8Array => {
  return nacl.randomBytes(nacl.secretbox.keyLength);
};

// Encrypt group key with user's public key
export const encryptGroupKey = (
  groupKey: Uint8Array,
  userPublicKey: string,
  senderPrivateKey: string
): { encrypted: string; nonce: string; ephemeralPublicKey: string } => {
  const groupKeyStr = encodeBase64(groupKey);
  return encryptMessage(groupKeyStr, userPublicKey, senderPrivateKey);
};

// Decrypt group key with user's private key
export const decryptGroupKey = (
  encryptedGroupKey: { encrypted: string; nonce: string; ephemeralPublicKey: string },
  userPrivateKey: string
): Uint8Array => {
  const decryptedStr = decryptMessage(encryptedGroupKey, userPrivateKey);
  return decodeBase64(decryptedStr);
};

// Encrypt message for group using shared secret key (Secretbox)
export const encryptGroupMessage = (
  message: string,
  groupKey: Uint8Array
): { encrypted: string; nonce: string } => {
  try {
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const messageBytes = decodeUTF8(message);
    const encrypted = nacl.secretbox(messageBytes, nonce, groupKey);
    
    if (!encrypted) {
      throw new Error('Group encryption failed');
    }
    
    return {
      encrypted: encodeBase64(encrypted),
      nonce: encodeBase64(nonce),
    };
  } catch (error) {
    console.error('Group encryption error:', error);
    throw new Error('Failed to encrypt group message');
  }
};

// Decrypt group message using shared secret key
export const decryptGroupMessage = (
  encrypted: string,
  nonce: string,
  groupKey: Uint8Array
): string => {
  try {
    const encryptedBytes = decodeBase64(encrypted);
    const nonceBytes = decodeBase64(nonce);
    
    const decrypted = nacl.secretbox.open(encryptedBytes, nonceBytes, groupKey);
    
    if (!decrypted) {
      throw new Error('Group decryption failed');
    }
    
    return encodeUTF8(decrypted);
  } catch (error) {
    console.error('Group decryption error:', error);
    return '[Decryption failed]';
  }
};
