// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Range, Position, DiagnosticSeverity, Diagnostic } from 'vscode-languageserver-types';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { offsetRange } from '@bfc/indexers';
import { DiagnosticSeverity as BFDiagnosticSeverity, Diagnostic as BFDiagnostic } from '@bfc/shared';
import { FoldingRange } from 'vscode-languageserver';

export interface LUOption {
  projectId: string;
  fileId: string;
  sectionId: string;
  luFeatures: any;
}

export interface Template {
  name: string;
  parameters?: string[];
  body: string;
}

export interface LUDocument {
  uri: string;
  projectId?: string;
  fileId?: string;
  sectionId?: string;
  luFeatures: any;
  index: () => any;
}

export declare type LUImportResolverDelegate = (
  source: string,
  resourceId: string
) => {
  content: string;
  id: string;
};

const severityMap = {
  [BFDiagnosticSeverity.Error]: DiagnosticSeverity.Error,
  [BFDiagnosticSeverity.Hint]: DiagnosticSeverity.Hint,
  [BFDiagnosticSeverity.Information]: DiagnosticSeverity.Information,
  [BFDiagnosticSeverity.Warning]: DiagnosticSeverity.Warning,
};

export function convertSeverity(severity: BFDiagnosticSeverity): DiagnosticSeverity {
  return severityMap[severity];
}

export function generateDiagnostic(message: string, severity: DiagnosticSeverity, document: TextDocument): Diagnostic {
  return {
    severity,
    range: Range.create(Position.create(0, 0), Position.create(0, 0)),
    message,
    source: document.uri,
  };
}

export function convertDiagnostics(lgDiags: BFDiagnostic[] = [], document: TextDocument, offset = 0): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const defaultRange = Range.create(Position.create(0, 0), Position.create(0, 0));
  lgDiags.forEach((diag) => {
    const range = diag.range ? offsetRange(diag.range, 1 + offset) : defaultRange;
    const diagnostic: Diagnostic = {
      severity: convertSeverity(diag.severity),
      range,
      message: diag.message,
      source: document.uri,
    };
    diagnostics.push(diagnostic);
  });
  return diagnostics;
}

export function getLineByIndex(document: TextDocument, line: number) {
  const lineCount = document.lineCount;
  if (line >= lineCount || line < 0) return null;

  return document.getText().split(/\r?\n/g)[line];
}

export function createFoldingRanges(document: TextDocument | undefined) {
  const items: FoldingRange[] = [];
  if (!document) {
    return items;
  }

  const lineCount = document.lineCount;
  let i = 0;
  while (i < lineCount) {
    const currLine = getLineByIndex(document, i);
    if (currLine?.startsWith('>>')) {
      for (let j = i + 1; j < lineCount; j++) {
        if (getLineByIndex(document, j)?.startsWith('>>')) {
          items.push(FoldingRange.create(i, j - 1));
          i = j - 1;
          break;
        }

        if (j === lineCount - 1) {
          items.push(FoldingRange.create(i, j));
          i = j;
        }
      }
    }

    i = i + 1;
  }

  return items;
}
