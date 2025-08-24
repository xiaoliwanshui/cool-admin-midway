// src/utils/crypto.util.ts
import { Config, ILogger, Inject, Provide } from '@midwayjs/core';
import * as crypto from 'crypto';

@Provide()
export class CryptoUtil {
  @Inject()
  logger: ILogger;
  @Config('cryptoConfig')
  cryptoConfig: {
    aesKey?: string;
    rsaPrivateKey?: string;
    rsaPublicKey?: string;
    defaultSalt: string
  };

  // AES 对称加密（CBC 模式）
  async aesEncrypt(text: string, key?: string): Promise<string> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(key || this.cryptoConfig.aesKey, 'hex'),
      iv
    );
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + encrypted;
  }

  // AES 对称解密
  async aesDecrypt(encryptedText: string, key?: string): Promise<string> {
    const iv = Buffer.from(encryptedText.slice(0, 32), 'hex');
    const content = encryptedText.slice(32);
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(key || this.cryptoConfig.aesKey, 'hex'),
      iv
    );
    let decrypted = decipher.update(content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // RSA 非对称加密
  async rsaEncrypt(text: string): Promise<string> {
    return crypto.publicEncrypt(
      {
        key: this.cryptoConfig.rsaPublicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
      },
      Buffer.from(text)
    ).toString('base64');
  }

  // RSA 非对称解密
  async rsaDecrypt(encryptedText: string): Promise<string> {
    return crypto.privateDecrypt(
      {
        key: this.cryptoConfig.rsaPrivateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
      },
      Buffer.from(encryptedText, 'base64')
    ).toString('utf8');
  }

  // SHA256 哈希加盐
  async sha256(text: string, salt?: string): Promise<string> {
    const hash = crypto.createHash('sha256');
    hash.update(text + (salt || this.cryptoConfig.defaultSalt));
    return hash.digest('hex');
  }

  // 生成随机盐值
  generateSalt(length = 16): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
