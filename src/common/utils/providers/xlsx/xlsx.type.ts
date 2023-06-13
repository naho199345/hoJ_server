type NumberFormat = string | number;

interface Comment {
  /** Author of the comment block */
  a?: string;

  /** Plaintext of the comment */
  t: string;
}

/** Cell comments */
interface Comments extends Array<Comment> {
  /** Hide comment by default */
  hidden?: boolean;
}

interface CellAddress {
  /** Column number */
  column: number;
  /** Row number */
  row: number;
}

type ExcelDataType =
  | 'boolean'
  | 'number'
  | 'error'
  | 'string'
  | 'date'
  | 'zEmpty';

interface Hyperlink {
  /** Target of the link (HREF) */
  Target: string;

  /** Plaintext tooltip to display when mouse is over cell */
  Tooltip?: string;
}

export interface MJRObject {
  row: Record<string, any> | Array<any>;
  isempty: boolean;
}

export interface Range {
  /** Starting cell */
  start: CellAddress;
  /** Ending cell */
  end: CellAddress;
}

export type RawValue = string | number | boolean | Date | null;

export interface CellObject {
  /** The raw value of the cell.  Can be omitted if a formula is specified */
  value?: RawValue;

  /** Formatted text (if applicable) */
  word?: string;

  type: ExcelDataType;

  /** Cell formula (if applicable) */
  formula?: string;

  /** Range of enclosing array if formula is array formula (if applicable) */
  F?: string;

  /** Rich text encoding (if applicable) */
  richWord?: any;

  /** HTML rendering of the rich text (if applicable) */
  html?: string;

  /** Comments associated with the cell */
  comments?: Comments;

  /** Number format string associated with the cell (if requested) */
  zNumber?: NumberFormat;

  /** Cell hyperlink object (.Target holds link, .tooltip is tooltip) */
  link?: Hyperlink;

  /** The style/theme of the cell (if applicable) */
  style?: any;
}
