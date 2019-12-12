// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Diagnostic, DiagnosticSeverity } from '../diagnostic';

export function createSingleMessage(d: Diagnostic): string {
  let msg = `${d.message}\n`;
  if (d.range) {
    const { start, end } = d.range;
    const position = `line ${start.line}:${start.character} - line ${end.line}:${end.character}`;
    msg = `${position} \n ${msg}`;
  }
  return msg;
}

export function combineMessage(diagnostics: Diagnostic[]): string {
  return diagnostics.reduce((msg, d) => {
    msg += createSingleMessage(d);
    return msg;
  }, '');
}

export function findErrors(diagnostics: Diagnostic[]): Diagnostic[] {
  return diagnostics.filter(d => d.severity === DiagnosticSeverity.Error);
}

export function isValid(diagnostics: Diagnostic[]): boolean {
  return diagnostics.every(d => d.severity !== DiagnosticSeverity.Error);
}
