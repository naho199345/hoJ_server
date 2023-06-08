/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import CryptoJS from 'crypto-js';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  encryptString = (email: string) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.SECRET_KEY), Buffer.alloc(16));
    return cipher.update(email, 'utf8', 'hex') + cipher.final('hex');
  };

  decryptString = (encryptedEmail: string) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.SECRET_KEY), Buffer.alloc(16));
    return decipher.update(encryptedEmail, 'hex', 'utf8') + decipher.final('utf8');
  };

  decodeBase64 = (value: string): string => {
    const buff = Buffer.from(value);
    const decoded = buff.toString('base64');
    return decoded;
  };

  encrypt = (value: string): string => {
    try {
      const ciphertext = CryptoJS.AES.encrypt(value, process.env.ENCRYPT_KEY).toString();
      return ciphertext;
    } catch (error) {
      console.error(error);
      return '';
    }
  };

  encryptWithKey = (value: string, key: string): string => {
    try {
      const ciphertext = CryptoJS.AES.encrypt(value, key).toString();
      return ciphertext;
    } catch (error) {
      console.error(error);
      return '';
    }
  };

  decrypt = (encrypted: string): string => {
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, process.env.ENCRYPT_KEY);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      return originalText;
    } catch (error) {
      console.error(error);
      return '';
    }
  };

  decryptWithKey = (encrypted: string, key: string): string => {
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, key);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      return originalText;
    } catch (error) {
      console.error(error);
      return '';
    }
  };

  verify = (encrypted: string, originalText: string): boolean => {
    return this.decrypt(encrypted) === originalText;
  };

  hash = (value: string): string => {
    try {
      const hashed = CryptoJS.SHA256(value).toString(CryptoJS.enc.Base64);
      return hashed;
    } catch (error) {
      console.error(error);
      return '';
    }
  };

  verifyHash = (hashed: string, value: string): boolean => {
    return this.hash(value) === hashed;
  };

  hashSalt = (
    value: string,
    hmacSalt?: string,
  ): {
    salt: string;
    value: string;
  } => {
    const SALT_LEN = 64;
    const salt = hmacSalt || CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Base64).slice(0, SALT_LEN);

    return {
      salt,
      value: CryptoJS.HmacSHA256(value, salt).toString(CryptoJS.enc.Base64),
    };
  };
}
