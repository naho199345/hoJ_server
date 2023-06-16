/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/naming-convention */
import { BadRequestException } from '@nestjs/common';
import { ObjectType, ExcelColumns } from 'src/interface';
// import SSF from 'SSF';
import { Sheet2JSONOpts, SSF, WorkSheet } from 'xlsx';

import { CellObject, MJRObject, Range, RawValue } from './xlsx.type';

/* [MS-XLSB] 2.5.97.2 */
const BErr: ObjectType<string> = {
  0x00: '#NULL!',
  0x07: '#DIV/0!',
  0x0f: '#VALUE!',
  0x17: '#REF!',
  0x1d: '#NAME?',
  0x24: '#NUM!',
  0x2a: '#N/A',
  0x2b: '#GETTING_DATA',
  0xff: '#WTF?',
};

const basedate = new Date(1899, 11, 30, 0, 0, 0); // 2209161600000

function datenum(value: Date): number {
  const epoch = value.getTime();
  const dnthresh = basedate.getTime() + (value.getTimezoneOffset() - basedate.getTimezoneOffset()) * 60000;
  return (epoch - dnthresh) / (24 * 60 * 60 * 1000);
}

function safe_format_cell(cell: CellObject, value: RawValue): string {
  if (cell.zNumber) {
    try {
      const isDate = cell.type === 'date' && value instanceof Date;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      cell.word = SSF.format(cell.zNumber, isDate ? datenum(value) : value);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      return SSF.format(cell.zNumber, isDate ? datenum(value) : value);
    } catch (e) {}
  }
  return value?.toString() || '';
}

function format_cell(cell: CellObject, value: RawValue, sheetOptions: Sheet2JSONOpts): string {
  if (!cell || !cell.type || cell.type === 'zEmpty') {
    return '';
  }
  if (cell.word?.length) {
    return cell.word;
  }

  if (cell.type === 'date' && sheetOptions?.dateNF && !cell.zNumber) {
    cell.zNumber = sheetOptions.dateNF;
  }
  if (cell.type === 'error') {
    const result = BErr[cell.value?.toString() || ''] || cell.value;
    return result?.toString() || '';
  }
  if (value === undefined) {
    return cell.value ? safe_format_cell(cell, cell.value) : '';
  }
  return safe_format_cell(cell, value);
}

function encode_col(colNum: number): string {
  let _colNum = colNum;
  if (_colNum < 0) {
    throw new Error(`invalid column ${colNum}`);
  }
  let result = '';
  for (++_colNum; _colNum; _colNum = Math.floor((_colNum - 1) / 26)) {
    const colCode = String.fromCharCode(((_colNum - 1) % 26) + 65);
    result = `${colCode}${result}`;
  }
  return result;
}

function encode_row(rowNum: number): string {
  return (rowNum + 1).toString();
}

function safe_decode_range(rawRange: string): Range {
  const range: Range = {
    start: { column: 0, row: 0 },
    end: { column: 0, row: 0 },
  };

  let idx = 0;
  let i = 0;
  let charCode = 0;
  for (idx = 0; i < rawRange.length; ++i) {
    charCode = rawRange.charCodeAt(i) - 64;
    if (charCode < 1 || charCode > 26) {
      break;
    }
    idx = 26 * idx + charCode;
  }
  range.start.column = --idx;

  for (idx = 0; i < rawRange.length; ++i) {
    charCode = rawRange.charCodeAt(i) - 48;
    if (charCode < 0 || charCode > 9) {
      break;
    }
    idx = 10 * idx + charCode;
  }
  range.start.row = --idx;

  if (i === rawRange.length || charCode !== 10) {
    range.end.column = range.start.column;
    range.end.row = range.start.row;
    return range;
  }
  ++i;

  for (idx = 0; i !== rawRange.length; ++i) {
    charCode = rawRange.charCodeAt(i) - 64;
    if (charCode < 1 || charCode > 26) {
      break;
    }
    idx = 26 * idx + charCode;
  }
  range.end.column = --idx;

  for (idx = 0; i !== rawRange.length; ++i) {
    charCode = rawRange.charCodeAt(i) - 48;
    if (charCode < 0 || charCode > 9) {
      break;
    }
    idx = 10 * idx + charCode;
  }
  range.end.row = --idx;

  return range;
}

const rangeFor = (sheet: WorkSheet): Range => {
  let range: Range = {
    start: { row: 0, column: 0 },
    end: { row: 0, column: 0 },
  };
  const rawRange = sheet['!ref'] || range;

  switch (typeof rawRange) {
    case 'string':
      range = safe_decode_range(rawRange);
      break;
    case 'number':
      range = safe_decode_range(sheet['!ref']!);
      range.start.row = rawRange;
      break;
    default:
      range = rawRange;
  }
  return range;
};

const colsFor = (range: Range): string[] => {
  const cols = [];
  for (let colNum = range.start.column; colNum <= range.end.column; ++colNum) {
    cols[colNum] = encode_col(colNum);
  }
  return cols;
};

const denseFor = (sheet: WorkSheet): boolean => Array.isArray(sheet);

const validateExcelHeader = (headers: string[], headerName: string): string => {
  if (headers.includes(ExcelColumns[headerName as keyof typeof ExcelColumns])) {
    throw new BadRequestException(`[${headerName}] 엑셀 타이틀이 중복되었습니다.`);
  }

  const isValidateExcelColumn = Object.keys(ExcelColumns).includes(headerName);
  if (!isValidateExcelColumn) {
    throw new BadRequestException(
      `[${headerName}]는 유효한 엑셀 타이틀이 아닙니다. 유효 타이틀: ${Object.keys(ExcelColumns).join(', ')}`,
    );
  }

  return ExcelColumns[headerName as keyof typeof ExcelColumns];
};

const headersFor = (sheet: WorkSheet, sheetOptions: Sheet2JSONOpts): string[] => {
  const range = rangeFor(sheet);
  const cols = colsFor(range);

  const headers: string[] = [];
  for (let colNum = range.start.column; colNum <= range.end.column; ++colNum) {
    let cell = denseFor(sheet) ? sheet[range.start.row][colNum] : sheet[cols[colNum] + encode_row(range.start.row)];
    cell = cell || { word: '__EMPTY', type: 'string' };

    let headerName = format_cell(cell, null, sheetOptions);
    headerName = validateExcelHeader(headers, headerName);
    headers[colNum] = headerName;
  }
  return headers;
};

const enrichDefaultRow = (row: any, rowNum: number): void => {
  if (Object.defineProperty) {
    try {
      Object.defineProperty(row, '__rowNum__', {
        value: rowNum,
        enumerable: false,
      });
    } catch (e) {
      row.__rowNum__ = rowNum;
    }
  } else {
    row.__rowNum__ = rowNum;
  }
};

function make_json_row(sheet: WorkSheet, sheetOptions: Sheet2JSONOpts, rowNum: number): MJRObject {
  const dense = denseFor(sheet);
  const range = rangeFor(sheet);

  const headers = headersFor(sheet, sheetOptions);
  const cols = colsFor(range);

  const defaultValue = sheetOptions.defval || null;
  const useRawValue = sheetOptions.raw || !Object.prototype.hasOwnProperty.call(sheetOptions, 'raw');

  let isempty = true;
  const row: any = {};
  enrichDefaultRow(row, rowNum);

  if (dense && !sheet[rowNum]) {
    return { row, isempty };
  }

  for (let colNum = range.start.column; colNum <= range.end.column; ++colNum) {
    if (headers[colNum] == null) {
      continue;
    }

    const cell: CellObject = dense ? sheet[rowNum][colNum] : sheet[cols[colNum] + encode_row(rowNum)];

    if (cell === undefined || cell.type === undefined) {
      if (defaultValue === undefined) {
        continue;
      }
      row[headers[colNum]] = defaultValue;
      continue;
    }

    let cellValue = cell.value;
    switch (cell.type) {
      case 'zEmpty':
        if (cellValue == null) break;
        continue;
      case 'error':
        // eslint-disable-next-line eqeqeq
        cellValue = cellValue == 0 ? null : undefined;
        break;
      case 'string':
      case 'date':
      case 'boolean':
      case 'number':
        break;
      default:
        throw new Error(`unrecognized type ${cell.type}`);
    }

    if (cellValue == null) {
      if (cell.type === 'error' && cellValue === null) {
        row[headers[colNum]] = null;
      } else if (defaultValue !== undefined) {
        row[headers[colNum]] = defaultValue;
      } else if (useRawValue && cellValue === null) {
        row[headers[colNum]] = null;
      } else {
        continue;
      }
    } else {
      cellValue =
        useRawValue || (sheetOptions.rawNumbers && cell.type === 'number')
          ? `${cellValue}`.trim()
          : format_cell(cell, cellValue, sheetOptions)
              .replace(/\0[\s\S]*$/g, '')
              .trim();

      row[headers[colNum]] = cellValue;
    }

    if (cellValue?.length) {
      isempty = false;
    }
  }

  return { row, isempty };
}

const typedAttrValue = (attrKey: string, attrValue: unknown): unknown => {
  let result = attrValue;
  if (attrKey === 'type') {
    switch (attrValue) {
      case 'b':
        result = 'boolean';
        break;
      case 'n':
        result = 'number';
        break;
      case 'e':
        result = 'error';
        break;
      case 's':
        result = 'string';
        break;
      case 'd':
        result = 'date';
        break;
      case 'z':
        result = 'zEmpty';
        break;
      default:
        break;
    }
  }
  return result;
};

const typedSheet = (sheet: WorkSheet): void => {
  Object.entries(sheet).forEach(([cellKey, cell]) => {
    if (cellKey === '!ref' || cellKey === '!margins') {
      return;
    }
    Object.entries(cell).forEach(([attrKey, attrValue]) => {
      let _attrKey = '';
      switch (attrKey) {
        case 'v':
          _attrKey = 'value';
          break;
        case 'w':
          _attrKey = 'word';
          break;
        case 't':
          _attrKey = 'type';
          break;
        case 'f':
          _attrKey = 'formula';
          break;
        case 'F':
          _attrKey = 'F';
          break;
        case 'r':
          _attrKey = 'richWord';
          break;
        case 'h':
          _attrKey = 'html';
          break;
        case 'c':
          _attrKey = 'comments';
          break;
        case 'z':
          _attrKey = 'zNumber';
          break;
        case 'l':
          _attrKey = 'link';
          break;
        case 's':
          _attrKey = 'style';
          break;
        default:
          break;
      }

      sheet[cellKey][_attrKey] = typedAttrValue(_attrKey, attrValue);
      delete sheet[cellKey][attrKey];
    });
  });
};

export function sheet_to_json({
  sheet,
  sheetOptions = {},
}: {
  sheet: WorkSheet;
  sheetOptions?: Sheet2JSONOpts;
}): any[] {
  if (!sheet || sheet['!ref'] == null) {
    return [];
  }
  typedSheet(sheet);

  const dense = denseFor(sheet);
  const range = rangeFor(sheet);
  if (dense && !sheet[range.start.row]) {
    sheet[range.start.row] = [];
  }

  const offset = 1;

  const jsonData = [];
  let length = 0;
  for (let rowNum = range.start.row + offset; rowNum <= range.end.row; ++rowNum) {
    const row = make_json_row(sheet, sheetOptions, rowNum);

    if (!row.isempty || sheetOptions.blankrows) {
      jsonData[length++] = row.row;
    }
  }

  jsonData.length = length;
  return jsonData;
}
