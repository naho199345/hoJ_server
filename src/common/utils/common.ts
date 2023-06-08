import fs from 'fs';
import path from 'path';
import { ObjectType } from 'src/common/interfaces/ObjectType';

export const isObject = <T>(value: T): value is T & ObjectType => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

export const extensionFor = (fileUri: string): string => {
  return path.extname(fileUri).slice(1);
};

export const unlink = async (filePath: string): Promise<void> => {
  await new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      err ? reject(err) : resolve('');
    });
  });
};
