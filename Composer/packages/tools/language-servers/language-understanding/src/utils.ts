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

export function createFoldingRanges(lines: string[], prefix: string) {
  const items: FoldingRange[] = [];

  if (!lines?.length) {
    return items;
  }

  const lineCount = lines.length;
  let startIdx = -1;

  for (let i = 0; i < lineCount; i++) {
    if (lines[i].trim().startsWith(prefix)) {
      if (startIdx !== -1) {
        items.push(FoldingRange.create(startIdx, i - 1));
      }

      startIdx = i;
    }
  }

  if (startIdx !== -1) {
    items.push(FoldingRange.create(startIdx, lineCount - 1));
  }

  return items;
}
