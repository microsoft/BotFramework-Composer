// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Diagnostic, DiagnosticSeverity, Range, Position, LgFile, LuFile } from '@bfc/shared';
import formatMessage from 'format-message';

export function createSingleMessage(d: Diagnostic): string {
  let msg = `${d.message}\n`;
  if (d.range) {
    const { start, end } = d.range;
    const position = formatMessage(`line {startLine}:{startCharacter} - line {endLine}:{endCharacter}`, {
      startLine: start.line,
      startCharacter: start.character,
      endLine: end.line,
      endCharacter: end.character,
    });
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
      const position = formatMessage(`L{startLine}:{startCharacter} - L{endLine}:{endCharacter} `, {
        startLine: start.line,
        startCharacter: start.character,
        endLine: end.line,
        endCharacter: end.character,
      });
      msg += position;
    }
    let errorInfo = diagnostic.message;
    if (diagnostic.message.includes('error message: ')) {
      errorInfo = diagnostic.message.split('error message: ')[1] || '';
    }
    return msg + errorInfo;
  }
  return '';
}

export function offsetRange(range: Range, offset: number): Range {
  return new Range(
    new Position(range.start.line - offset, range.start.character),
    new Position(range.end.line - offset, range.end.character)
  );
}

export function isDiagnosticWithInRange(diagnostic: Diagnostic, range: Range): boolean {
  if (!diagnostic.range) return false;
  return diagnostic.range.start.line >= range.start.line && diagnostic.range.end.line <= range.end.line;
}

export function filterTemplateDiagnostics(file: LgFile, name: string): Diagnostic[] {
  const { diagnostics, templates } = file;
  const range = templates.find((t) => t.name === name)?.range;

  if (!range) return [];
  const filteredDiags = diagnostics.filter((d) => {
    return d.range && isDiagnosticWithInRange(d, range);
  });
  const offset = range.start.line;
  return filteredDiags.map((d) => {
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

export function filterSectionDiagnostics(file: LuFile, name: string): Diagnostic[] {
  const { diagnostics, intents } = file;
  const range = intents.find((t) => t.Name === name)?.range;

  if (!range) return diagnostics;
  const filteredDiags = diagnostics.filter((d) => {
    return isDiagnosticWithInRange(d, range);
  });
  const offset = range.start.line;
  return filteredDiags.map((d) => {
    const { range } = d;
    if (range) {
      return { ...d, range: offsetRange(range, offset) };
    }
    return d;
  });
}

export function findErrors(diagnostics: Diagnostic[]): Diagnostic[] {
  return diagnostics.filter((d) => d.severity === DiagnosticSeverity.Error);
}

export function findWarnings(diagnostics: Diagnostic[]): Diagnostic[] {
  return diagnostics.filter((d) => d.severity === DiagnosticSeverity.Warning);
}

export function isValid(diagnostics: Diagnostic[]): boolean {
  return diagnostics.every((d) => d.severity !== DiagnosticSeverity.Error);
}
