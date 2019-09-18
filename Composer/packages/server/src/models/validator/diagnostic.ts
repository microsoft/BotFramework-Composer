export interface Diagnostic {
  severity: DiagnosticSeverity;

  message: string;

  /*
   * path and range are to help locate the error,
   * path is used for json or any structured content
   * range is used for text-based content
   */
  path?: string;
  range?: Range;

  /*
   * source is used to indentify the source of this error
   * usually it's a resource id
   */
  source?: string;

  /*
   * code is a machine readable idenfier to classify error
   * and allow further or alternative intepretation of this error
   * for example CA2001
   */
  code?: string;
}

export interface Range {
  start: Position;
  end: Position;
}

export interface Position {
  line: number;
  character: number;
}

export enum DiagnosticSeverity {
  Error = 0,
  Warning = 1,
  Information = 2,
  Hint = 3,
}
