// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TextDocument, Range, Position, DiagnosticSeverity, Diagnostic } from 'vscode-languageserver-types';
import {
  DiagnosticSeverity as BFIndexerDiagnosticSeverity,
  Diagnostic as BFIndexerDiagnostic,
  offsetRange,
} from '@bfc/indexers';
import { LuIntent, textFromIntent } from '@bfc/indexers/lib/utils/luUtil';
import { luIndexer } from '@bfc/indexers';
const { parse } = luIndexer;

export interface LUOption {
  fileId: string;
  sectionId: string;
}

export interface Template {
  name: string;
  parameters?: string[];
  body: string;
}

export interface LUDocument {
  uri: string;
  fileId?: string;
  sectionId?: string;
  index: () => any;
}

export declare type ImportResolverDelegate = (
  source: string,
  resourceId: string
) => {
  content: string;
  id: string;
};

const severityMap = {
  [BFIndexerDiagnosticSeverity.Error]: DiagnosticSeverity.Error,
  [BFIndexerDiagnosticSeverity.Hint]: DiagnosticSeverity.Hint,
  [BFIndexerDiagnosticSeverity.Information]: DiagnosticSeverity.Information,
  [BFIndexerDiagnosticSeverity.Warning]: DiagnosticSeverity.Warning,
};

export function convertSeverity(severity: BFIndexerDiagnosticSeverity): DiagnosticSeverity {
  return severityMap[severity];
}

export function generageDiagnostic(message: string, severity: DiagnosticSeverity, document: TextDocument): Diagnostic {
  return {
    severity,
    range: Range.create(Position.create(0, 0), Position.create(0, 0)),
    message,
    source: document.uri,
  };
}

// if section, offset +1 to exclude #IntentName
export function convertDiagnostics(
  lgDiags: BFIndexerDiagnostic[] = [],
  document: TextDocument,
  offset = 0
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const defaultRange = Range.create(Position.create(0, 0), Position.create(0, 0));
  lgDiags.forEach(diag => {
    // offset +1, lsp start from line:0, but monaco/composer start from line:1
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

export function textFromTemplate(template: Template): string {
  const { name, parameters = [], body } = template;
  const textBuilder: string[] = [];
  if (name && body) {
    textBuilder.push(`# ${name.trim()}`);
    if (parameters.length) {
      textBuilder.push(`(${parameters.join(', ')})`);
    }
    textBuilder.push(`\n${template.body.trim()}`);
  }
  return textBuilder.join('');
}

export function checkSection(intent: LuIntent): BFIndexerDiagnostic[] {
  let { Name } = intent;
  const { Body } = intent;
  if (Name.includes('/')) {
    const [, childName] = Name.split('/');
    Name = childName;
  }
  const text = textFromIntent({ Name, Body });
  return parse(text).diagnostics;
}
