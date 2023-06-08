import { HttpException } from '@nestjs/common';
import { camelCase } from 'change-case';
import { ObjectType } from '../interfaces';

export class ResponseMessage {
  private statusCode: number;
  private success: boolean;
  private data: any | any[];
  private error: string;

  public errorMessage(statusCode = 10000, message = 'Error'): ResponseMessage {
    this.data = { message };
    this.statusCode = statusCode;
    this.error = 'BadRequestException';
    return this;
  }

  public body(data: any | any[] = ''): ResponseMessage {
    this.camelizeKey(data);
    this.success = true;
    this.data = data;
    return this;
  }

  get Success(): boolean {
    return this.success;
  }

  get Data(): any | any[] {
    return this.data;
  }

  get StatusCode(): number {
    return this.statusCode;
  }

  get Error(): string {
    return this.data, this.error;
  }

  public build(): ErrResponse {
    return new ErrResponse(this);
  }

  private camelizeKey = (data: unknown): void => {
    if (Array.isArray(data)) {
      for (const subData of data) {
        this.camelizeKey(subData);
      }
    }
    if (this.isObject(data)) {
      Object.entries(data).forEach(([key, value]) => {
        const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
        if (camelCase(key) && camelCase(key) !== key && !korean.test(key)) {
          data[camelCase(key)] = value;
          delete data[key];
        }
      });
    }
  };

  private isObject = <T>(value: T): value is T & ObjectType => {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  };
}

export class SuccessResponse {
  success: boolean;
  data: any | any[];

  constructor(message: ResponseMessage) {
    this.success = message.Success;
    this.data = message.Data;
  }
}

export class ErrResponse {
  statusCode: number;
  response: any | any[];

  constructor(message: ResponseMessage) {
    this.statusCode = message.StatusCode;
    this.response = {
      message: message.Data.message,
      error: 'BadRequestException',
    };
  }
}
