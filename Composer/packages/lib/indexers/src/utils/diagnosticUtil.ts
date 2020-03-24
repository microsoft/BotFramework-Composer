// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuIntentSection } from '@bfc/shared';

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

export function combineSimpleMessage(diagnostics: Diagnostic[]): string {
  const diagnostic = diagnostics[0];
  if (diagnostic) {
    let msg = '';
    if (diagnostic.range) {
      const { start, end } = diagnostic.range;
      const position = `L${start.line}:${start.character} - L${end.line}:${end.character} `;
      msg += position;
    }
    if (diagnostic.message.includes('error message:')) {
      const [, errorInfo] = diagnostic.message.split('error message: ');
      return msg + errorInfo;
    } else if (diagnostic.message.includes(']')) {
      // properly handle messages containing brackets
      const [, errorInfo] = diagnostic.message.split(']');
      return msg + errorInfo;
    } else {
      // this is some other weird case, so just print the whole message
      return msg + diagnostic.message;
    }
  }
  return '';
}

export function offsetRange(range: Range, offset: number): Range {
  return new Range(
    new Position(range.start.line - offset, range.start.character),
    new Position(range.end.line - offset, range.end.character)
  );
}

export function isDiagnosticWithInRange(diagnostic: Diagnostic, range: CodeRange): boolean {
  if (!diagnostic.range) return false;
  return diagnostic.range.start.line >= range.startLineNumber && diagnostic.range.end.line <= range.endLineNumber;
}

export function filterTemplateDiagnostics(diagnostics: Diagnostic[], { range }: { range?: CodeRange }): Diagnostic[] {
  if (!range) return diagnostics;
  const filteredDiags = diagnostics.filter(d => {
    return d.range && isDiagnosticWithInRange(d, range);
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

export function filterSectionDiagnostics(diagnostics: Diagnostic[], section: LuIntentSection): Diagnostic[] {
  const { range } = section;
  if (!range) return diagnostics;
  const filteredDiags = diagnostics.filter(d => {
    return isDiagnosticWithInRange(d, range);
  });
  const offset = range.startLineNumber;
  return filteredDiags.map(d => {
    const { range } = d;
    if (range) {
      d.range = offsetRange(range, offset);
    }
    return d;
  });
}

export function findErrors(diagnostics: Diagnostic[]): Diagnostic[] {
  return diagnostics.filter(d => d.severity === DiagnosticSeverity.Error);
}

export function findWarnings(diagnostics: Diagnostic[]): Diagnostic[] {
  return diagnostics.filter(d => d.severity === DiagnosticSeverity.Warning);
}

export function isValid(diagnostics: Diagnostic[]): boolean {
  return diagnostics.every(d => d.severity !== DiagnosticSeverity.Error);
}
