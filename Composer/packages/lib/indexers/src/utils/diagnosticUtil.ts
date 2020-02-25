// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Diagnostic, DiagnosticSeverity, Range, Position } from '../diagnostic';
import { CodeRange } from '../type';

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

export function offsetRange(range: Range, offset: number): Range {
  return new Range(
    new Position(range.start.line - offset, range.start.character),
    new Position(range.end.line - offset, range.end.character)
  );
}

export function filterTemplateDiagnostics(diagnostics: Diagnostic[], { range }: { range?: CodeRange }): Diagnostic[] {
  if (!range) return diagnostics;
  const filteredDiags = diagnostics.filter(d => {
    return d.range && d.range.start.line >= range.startLineNumber && d.range.end.line <= range.endLineNumber;
  });
  const offset = range.startLineNumber;
  return filteredDiags.map(d => {
    const { range } = d;
    if (range) {
      return {
        ...d,
        range: offsetRange(range, offset),
      };
    }
    return d;
  });
}

export function findErrors(diagnostics: Diagnostic[]): Diagnostic[] {
  return diagnostics.filter(d => d.severity === DiagnosticSeverity.Error);
}

export function isValid(diagnostics: Diagnostic[]): boolean {
  return diagnostics.every(d => d.severity !== DiagnosticSeverity.Error);
}
