// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuIntentSection, Diagnostic, DiagnosticSeverity, Range, Position, CodeRange } from '@bfc/shared';

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
    const [, errorInfo] = diagnostic.message.split('error message: ');
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

export function isDiagnosticWithInRange(diagnostic: Diagnostic, range: CodeRange): boolean {
  if (!diagnostic.range) return false;
  return diagnostic.range.start.line >= range.startLineNumber && diagnostic.range.end.line <= range.endLineNumber;
}

export function filterTemplateDiagnostics(diagnostics: Diagnostic[], { range }: { range?: CodeRange }): Diagnostic[] {
  if (!range) return [];
  const filteredDiags = diagnostics.filter(d => {
    return d.range && isDiagnosticWithInRange(d, range);
  });
  const offset = range.startLineNumber;
  return filteredDiags.map(d => {
    const { range } = d;
    if (range) {
      return {
        ...d,
        range: offsetRange(range, offset)
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
      return { ...d, range: offsetRange(range, offset) };
    }
    return d;
  });
}

export function findProblems(diagnostics: Diagnostic[]): { errors: Diagnostic[]; warnings: Diagnostic[] } {
  const errors: Array<Diagnostic> = [];
  const warnings: Array<Diagnostic> = [];

  diagnostics.forEach(diag => {
    switch (diag.severity) {
      case DiagnosticSeverity.Error:
        errors.push(diag);
        break;
      case DiagnosticSeverity.Warning:
        warnings.push(diag);
    }
  });

  return { errors, warnings };
}

export function isValid(diagnostics: Diagnostic[]): boolean {
  return diagnostics.every(d => d.severity !== DiagnosticSeverity.Error);
}
