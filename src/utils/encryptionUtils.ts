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
  static async encrypt<T extends { toString(): string }>(data: T, masterKey: string): Promise<string> {
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
      const key = await scryptAsync(masterKey, salt, this.keyLength);
      
      // Generate initialization vector
      const iv = randomBytes(this.ivLength);
      
      // Create cipher
      const cipher = createCipheriv(algorithm, key, iv);
      
      // Encrypt the data
      const dataString = data.toString();
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

      return Buffer.from(result).toString('base64');
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
      const key = await scryptAsync(masterKey, salt, this.keyLength);
      
      // Create decipher
      const decipher = createDecipheriv(algorithm, key, iv);
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
   * @param sensitiveFields - Array of field names to encrypt
   * @param masterKey - Master encryption key
   */
  static async encryptFields<T extends Record<string, any>>(
    data: T,
    sensitiveFields: (keyof T)[],
    masterKey: string
  ): Promise<T> {
    const result = { ...data };
    
    for (const field of sensitiveFields) {
      if (result[field]) {
        result[field] = await this.encrypt(
          typeof result[field] === 'string' ? result[field] : JSON.stringify(result[field]),
          masterKey
        );
      }
    }
    
    return result;
  }

  /**
   * Decrypts sensitive fields in an object
   * @param data - Object containing encrypted data
   * @param sensitiveFields - Array of field names to decrypt
   * @param masterKey - Master encryption key
   */
  static async decryptFields<T extends Record<string, any>>(
    data: T,
    sensitiveFields: (keyof T)[],
    masterKey: string
  ): Promise<T> {
    const result = { ...data };
    
    for (const field of sensitiveFields) {
      if (result[field]) {
        const decrypted = await this.decrypt(result[field], masterKey);
        try {
          result[field] = JSON.parse(decrypted);
        } catch {
          result[field] = decrypted;
        }
      }
    }
    
    return result;
  }
}
