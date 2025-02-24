// Use Web Crypto API for browser compatibility
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const ENCRYPTION_CONFIG = {
  keyLength: 32, // for AES-256
  saltLength: 32,
  ivLength: 12,
  algorithm: 'AES-GCM',
  iterations: 100000,
  hash: 'SHA-256'
} as const;

async function deriveKey(masterKey: string, salt: Uint8Array, usage: KeyUsage): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterKey),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ENCRYPTION_CONFIG.iterations,
      hash: ENCRYPTION_CONFIG.hash
    },
    keyMaterial,
    { name: ENCRYPTION_CONFIG.algorithm, length: 256 },
    false,
    [usage]
  );
}

export async function encrypt(data: string | Record<string, unknown>, masterKey: string): Promise<string> {
  if (!data) throw new Error('Data to encrypt cannot be null or undefined');
  if (!masterKey) throw new Error('Master key cannot be empty');

  try {
    // Generate a random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.saltLength));
    const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength));
    
    // Derive encryption key
    const key = await deriveKey(masterKey, salt, 'encrypt');
    
    // Encrypt the data
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_CONFIG.algorithm,
        iv
      },
      key,
      encoder.encode(dataString)
    );
    
    // Combine and encode components
    return JSON.stringify({
      v: 1, // version for future compatibility
      salt: btoa(String.fromCharCode(...salt)),
      iv: btoa(String.fromCharCode(...iv)),
      data: btoa(String.fromCharCode(...new Uint8Array(encryptedData)))
    });
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function decrypt(encryptedData: string, masterKey: string): Promise<string> {
  if (!encryptedData) throw new Error('Data to decrypt cannot be null or undefined');
  if (!masterKey) throw new Error('Master key cannot be empty');

  try {
    const { v, salt, iv, data } = JSON.parse(encryptedData);
    if (v !== 1) throw new Error('Unsupported encryption version');

    // Convert base64 strings back to Uint8Arrays
    const saltArray = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
    const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
    const encryptedArray = Uint8Array.from(atob(data), c => c.charCodeAt(0));

    // Derive decryption key
    const key = await deriveKey(masterKey, saltArray, 'decrypt');

    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_CONFIG.algorithm,
        iv: ivArray
      },
      key,
      encryptedArray
    );

    return decoder.decode(decryptedData);
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function encryptFields<T extends Record<string, unknown>>(data: T, masterKey: string): Promise<T> {
  const result = { ...data };
  for (const field of Object.keys(data) as Array<keyof T>) {
    const value = result[field];
    if (typeof value === 'string') {
      result[field] = await encrypt(value, masterKey) as unknown as T[keyof T];
    } else if (value && typeof value === 'object') {
      result[field] = await encrypt(value as Record<string, unknown>, masterKey) as unknown as T[keyof T];
    }
  }
  return result;
}

export async function decryptFields<T extends Record<string, unknown>>(data: T, masterKey: string): Promise<T> {
  const result = { ...data };
  for (const field of Object.keys(data) as Array<keyof T>) {
    const value = result[field];
    if (typeof value === 'string') {
      result[field] = await decrypt(value, masterKey) as unknown as T[keyof T];
    }
  }
  return result;
}
