// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type IRange = {
  start: IPosition;
  end: IPosition;
};

export type IPosition = {
  line: number;
  character: number;
};

export enum DiagnosticSeverity {
  Error = 0,
  Warning = 1,
  Information = 2,
  Hint = 3,
}

export type IDiagnostic = {
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
  range?: IRange;
  path?: string;

  /*
   * code is a machine readable idenfier to classify error
   * and allow further or alternative intepretation of this error
   * for example CA2001
   */
  code?: string;
};
