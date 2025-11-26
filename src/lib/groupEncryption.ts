// Group encryption utilities using TweetNaCl Secretbox
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';

export interface GroupKey {
  groupId: string;
  key: string; // Base64 encoded key
}

const GROUP_KEYS_STORAGE = 'group_encryption_keys';

// Get group key from localStorage
export const getGroupKey = (groupId: string): Uint8Array | null => {
  try {
    const stored = localStorage.getItem(GROUP_KEYS_STORAGE);
    if (!stored) return null;
    const keys: GroupKey[] = JSON.parse(stored);
    const groupKey = keys.find(k => k.groupId === groupId);
    if (!groupKey) return null;
    return decodeBase64(groupKey.key);
  } catch {
    return null;
  }
};

// Store group key in localStorage
export const setGroupKey = (groupId: string, key: Uint8Array): void => {
  try {
    const stored = localStorage.getItem(GROUP_KEYS_STORAGE);
    const keys: GroupKey[] = stored ? JSON.parse(stored) : [];
    const existing = keys.findIndex(k => k.groupId === groupId);
    const keyStr = encodeBase64(key);
    if (existing >= 0) {
      keys[existing].key = keyStr;
    } else {
      keys.push({ groupId, key: keyStr });
    }
    localStorage.setItem(GROUP_KEYS_STORAGE, JSON.stringify(keys));
  } catch (error) {
    console.error('Error storing group key:', error);
  }
};

// Generate new group key
export const generateGroupKey = (): Uint8Array => {
  return nacl.randomBytes(nacl.secretbox.keyLength);
};
