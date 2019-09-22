export class Diagnostic {
  /**
   * Error
   * Warning
   * Information
   * Hint
   */
  severity: DiagnosticSeverity;

  /**
   * human-readable message
   */
  message: string;

  /**
   * source is used to indentify the source of this error
   * ie, resource id or file name
   */
  source: string;

  /**
   * path and range are to help locate the error,
   * path is used for json or any structured content
   * range is used for text-based content
   */
  range?: Range;
  path?: string;

  /*
   * code is a machine readable idenfier to classify error
   * and allow further or alternative intepretation of this error
   * for example CA2001
   */
  code?: string;

  constructor(message: string, source: string, severity?: DiagnosticSeverity) {
    this.message = message;
    this.source = source;
    this.severity = severity ? severity : DiagnosticSeverity.Error;
  }
}

export class Range {
  start: Position;
  end: Position;

  constructor(start: Position, end: Position) {
    this.start = start;
    this.end = end;
  }
}

export class Position {
  line: number;
  character: number;

  constructor(line: number, character: number) {
    this.line = line;
    this.character = character;
  }
}

export enum DiagnosticSeverity {
  Error = 0,
  Warning = 1,
  Information = 2,
  Hint = 3,
}
