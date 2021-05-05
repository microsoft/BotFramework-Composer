// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type MonacoPosition = {
  lineNumber: number;
  column: number;
};

export type MonacoRange = {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
};

export type MonacoEdit = {
  range: MonacoRange;
  text: string;
  forceMoveMarkers: boolean;
};
