import type { CipherKey } from 'crypto';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const algorithm = 'aes-256-gcm';
const scryptAsync = promisify(scrypt);

export class EncryptionService {
  private static readonly keyLength = 32; // for AES-256
  private static readonly saltLength = 32;
  private static readonly ivLength = 12; // for GCM mode
  private static readonly tagLength = 16; // for authentication tag

  /**
   * Encrypts sensitive data
   * @param data - Data to encrypt
   * @param masterKey - Master encryption key (from environment variable)
   */
  static async encrypt(data: string | Record<string, any>, masterKey: string): Promise<string> {
    if (!data) {
      throw new Error('Data to encrypt cannot be null or undefined');
    }
    if (!masterKey) {
      throw new Error('Master key cannot be empty');
    }
    try {
      // Generate a random salt
      const salt = randomBytes(this.saltLength);
      
      // Generate key using scrypt
      const key = (await scryptAsync(masterKey, salt, this.keyLength)) as Buffer;
      
      // Generate initialization vector
      const iv = randomBytes(this.ivLength);
      
      // Create cipher
      const cipher = createCipheriv(algorithm, key as CipherKey, iv);
      
      // Encrypt the data
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      let encryptedData = cipher.update(dataString, 'utf8', 'base64');
      encryptedData += cipher.final('base64');
      
      // Get authentication tag
      const authTag = cipher.getAuthTag();
      
      // Combine all components
      const result = JSON.stringify({
        v: 1, // version for future compatibility
        salt: salt.toString('base64'),
        iv: iv.toString('base64'),
        data: encryptedData,
        tag: authTag.toString('base64')
      });

      return result;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Decrypts encrypted data
   * @param encryptedData - Data to decrypt
   * @param masterKey - Master encryption key (from environment variable)
   */
  static async decrypt(encryptedData: string, masterKey: string): Promise<string> {
    try {
      // Parse the encrypted data
      const parsed = JSON.parse(Buffer.from(encryptedData, 'base64').toString());
      
      if (parsed.v !== 1) {
        throw new Error('Unsupported encryption version');
      }

      // Extract components
      const salt = Buffer.from(parsed.salt, 'base64');
      const iv = Buffer.from(parsed.iv, 'base64');
      const tag = Buffer.from(parsed.tag, 'base64');
      
      // Generate key using scrypt
      const key = (await scryptAsync(masterKey, salt, this.keyLength)) as Buffer;
      
      // Create decipher
      const decipher = createDecipheriv(algorithm, key as CipherKey, iv);
      decipher.setAuthTag(tag);
      
      // Decrypt the data
      let decrypted = decipher.update(parsed.data, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  /**
   * Encrypts sensitive fields in an object
   * @param data - Object containing data to encrypt
   * @param masterKey - Master encryption key
   */
  static async encryptFields<T extends Record<string, any>>(data: T, masterKey: string): Promise<T> {
    const result = { ...data };
    for (const field of Object.keys(data) as Array<keyof T>) {
      result[field] = await this.encrypt(result[field], masterKey) as unknown as T[keyof T];
    }
    return result;
  }

  /**
   * Decrypts sensitive fields in an object
   * @param data - Object containing encrypted data
   * @param masterKey - Master encryption key
   */
  static async decryptFields<T extends Record<string, any>>(data: T, masterKey: string): Promise<T> {
    const result = { ...data };
    for (const field of Object.keys(data) as Array<keyof T>) {
      result[field] = await this.decrypt(result[field], masterKey) as unknown as T[keyof T];
    }
    return result;
  }
}
