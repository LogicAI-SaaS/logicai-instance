import * as crypto from 'crypto';

/**
 * Encryption Service - AES-256-GCM encryption for sensitive data
 * Uses Node.js built-in crypto module
 */
export class EncryptionService {
  private static instance: EncryptionService;
  private algorithm = 'aes-256-gcm';
  private key: Buffer;
  private keyLength = 32; // 256 bits
  private ivLength = 16;  // 128 bits
  private authTagLength = 16; // 128 bits for GCM auth tag

  private constructor() {
    const encryptionKey = process.env.ENCRYPTION_KEY;

    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is not set');
    }

    // Convert hex key to buffer
    this.key = Buffer.from(encryptionKey, 'hex');

    // Validate key length
    if (this.key.length !== this.keyLength) {
      throw new Error(
        `ENCRYPTION_KEY must be ${this.keyLength * 2} hex characters (${this.keyLength} bytes)`
      );
    }
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param plaintext - The data to encrypt
   * @returns Encrypted data in format: iv:authTag:encryptedData (all hex encoded)
   */
  encrypt(plaintext: string): string {
    // Generate a random IV
    const iv = crypto.randomBytes(this.ivLength);

    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv) as any;

    // Encrypt the data
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get the auth tag
    const authTag = (cipher as any).getAuthTag();

    // Return format: iv:authTag:encryptedData
    return [
      iv.toString('hex'),
      authTag.toString('hex'),
      encrypted,
    ].join(':');
  }

  /**
   * Decrypt data that was encrypted with encrypt()
   * @param encryptedData - Data in format: iv:authTag:encryptedData
   * @returns The decrypted plaintext
   * @throws Error if decryption fails
   */
  decrypt(encryptedData: string): string {
    try {
      // Split the encrypted data
      const parts = encryptedData.split(':');

      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const [ivHex, authTagHex, encrypted] = parts;

      // Convert from hex
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv) as any;

      // Set the auth tag
      (decipher as any).setAuthTag(authTag);

      // Decrypt the data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed: Invalid data or wrong encryption key');
    }
  }

  /**
   * Encrypt an object (converts to JSON first)
   * @param data - The object to encrypt
   * @returns Encrypted data string
   */
  encryptObject(data: any): string {
    const json = JSON.stringify(data);
    return this.encrypt(json);
  }

  /**
   * Decrypt an encrypted string to an object
   * @param encryptedData - The encrypted data string
   * @returns The decrypted object
   */
  decryptObject<T = any>(encryptedData: string): T {
    const json = this.decrypt(encryptedData);
    return JSON.parse(json);
  }

  /**
   * Generate a random encryption key (for setup purposes)
   * @returns A 32-byte key in hex format
   */
  static generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

// Export singleton instance
export default EncryptionService.getInstance();
