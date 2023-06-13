import { Injectable, InternalServerErrorException } from '@nestjs/common';
import contentDisposition from 'content-disposition';
import ExcelJS from 'exceljs';
import { Response } from 'express';
import fs from 'fs';
import * as js2xmlparser from 'js2xmlparser';
import mime from 'mime';
import moment from 'moment';
import path from 'path';
import { ErrorDefineMgr } from 'src/common/errorCode';
import { ObjectType, ServiceDto } from 'src/interface';
import xlsx from 'xlsx';
import { Formats, Zipster } from 'zipster';

import { ConfigService } from '../config.service';
import { DbService, QueryResponse } from '../index';
import { sheet_to_json } from './util';

export interface Downloadable {
  readStream: fs.ReadStream;
  fileName: string;
  type: string;
  fileUri?: string;
}

type BookType =
  | 'xlsx'
  | 'xlsm'
  | 'xlsb'
  | 'xls'
  | 'xla'
  | 'biff8'
  | 'biff5'
  | 'biff2'
  | 'xlml'
  | 'ods'
  | 'fods'
  | 'csv'
  | 'txt'
  | 'sylk'
  | 'html'
  | 'dif'
  | 'rtf'
  | 'prn'
  | 'eth';

interface XlsxDownOptions {
  prefixFilename: string;
  filePath?: string;
  extension?: BookType;
  sheetName?: string;
  password?: string;
  willDelete?: boolean;
}

interface XlsxMakeOptions {
  prefixFilename: string;
  filePath: string;
  extension: BookType;
  sheetName: string;
  password: string;
  willDelete: boolean;
}

@Injectable()
export class XlsxService {
  constructor(
    private readonly config: ConfigService,
    private readonly db: DbService,
  ) {}

  async downloadXlsx({
    res,
    query,
    params,
    options,
  }: {
    res: Response;
    query: string | string[];
    params: ServiceDto;
    options: XlsxDownOptions;
  }): Promise<any> {
    const xlsxMakeOptions = this.xlsxMakeOptionsFor(options);
    const { filePath, willDelete } = xlsxMakeOptions;

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
    }

    const result = await this.db.executesql(query, params);
    if (!result.data[0].length) {
      return res.status(500).json({
        statusCode: 10000,
        response: {
          statusCode: 10000,
          message: ErrorDefineMgr.common_Download_003,
          error: 'No Data',
        },
      });
    }
    const jsonData = result.data[0];
    const downloadable = await this.makeXlsx(xlsxMakeOptions, jsonData);

    this.downloadStream(res, downloadable, willDelete);
  }

  downloadSample = (res: Response, fileName: string): void => {
    this.downloadStream(res, {
      readStream: fs.createReadStream(
        path.join(this.config.get('fileUrl.samples'), fileName),
      ),
      fileName,
      type: mime.getType(fileName) || 'text/plain',
    });
  };

  sheetToJson = (fileUri: string): any[] => {
    const workbook = xlsx.readFile(fileUri);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = sheet_to_json({ sheet: worksheet });
    return jsonData;
  };

  uploadJsonData = async (
    jsonData: any,
    params: ObjectType,
  ): Promise<QueryResponse> => {
    params.xmlData = js2xmlparser.parse('data', jsonData);
    const result = await this.db.execute('spAdminInsertStudentUpload', params);
    return result;
  };

  private downloadStream(
    res: Response,
    downloadable: Downloadable,
    willDelete: boolean = false,
  ): void {
    const { readStream, fileUri, fileName, type } = downloadable;

    readStream.on('open', () => {
      res.set('Content-disposition', contentDisposition(fileName));
      res.set('Content-Type', type);
      readStream.pipe(res);
    });

    readStream.on('end', () => {
      if (willDelete && fileUri) {
        fs.unlink(fileUri, (err) => {
          if (err) {
            throw new InternalServerErrorException(err);
          }
        });
      }
    });

    readStream.on('error', () => {
      throw new InternalServerErrorException(
        '파일 다운로드 중 문제가 발생했습니다.',
      );
    });
  }

  private xlsxMakeOptionsFor(options: XlsxDownOptions): XlsxMakeOptions {
    return {
      prefixFilename: options.prefixFilename,
      filePath: options?.filePath || this.config.get('fileUrl.downloads'),
      sheetName: options?.sheetName || 'Sheet1',
      extension: options?.extension || 'xlsx',
      password: options?.password || '',
      willDelete: options?.willDelete || false,
    };
  }

  private async makeXlsx(
    xlsxMakeOptions: XlsxMakeOptions,
    jsonData: any,
  ): Promise<Downloadable> {
    const { prefixFilename, extension, filePath, password, sheetName } =
      xlsxMakeOptions;

    const file = `${prefixFilename}_${moment().format('YYYYMMDDHHmmssSSS')}`;
    let fileName = `${file}.${extension}`;
    const zipFileName = `${file}.zip`;
    let fileUri = path.join(filePath, fileName);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const jsonKeys = Object.keys(jsonData[0]);
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      filename: fileUri,
      useStyles: true,
      useSharedStrings: true,
    });
    const worksheet = workbook.addWorksheet(sheetName);
    const headKey = [];
    for (let i = 0; i < jsonKeys.length; i++) {
      headKey.push({
        header: jsonKeys[i],
        key: jsonKeys[i],
        width: 14,
        style: { font: { size: 12 }, numFmt: '@' },
      });
    }
    worksheet.columns = headKey;
    for (let i = 0; i < jsonData.length; i++) {
      worksheet.addRow(jsonData[i]).commit();
    }

    await workbook.commit();

    if (password) {
      await Zipster.fromPath(fileUri, {
        format: Formats.ZIP_ENCRYPTED,
        password,
        output: { name: file, path: filePath },
      });
      fileUri = path.join(filePath, zipFileName);
      fileName = zipFileName;
    }

    return {
      readStream: fs.createReadStream(fileUri),
      fileUri,
      fileName,
      type: mime.getType(fileName) || 'text/plain',
    };
  }
}
