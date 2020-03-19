// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TextDocument, Range, Position, DiagnosticSeverity, Diagnostic } from 'vscode-languageserver-types';
import {
  DiagnosticSeverity as LGDiagnosticSeverity,
  ImportResolver,
  Diagnostic as LGDiagnostic,
  StaticChecker,
  LGParser,
} from 'botbuilder-lg';
import { offsetRange } from '@bfc/indexers';
import { LgTemplate, Diagnostic as BFDiagnostic, LgFile, LgParsed } from '@bfc/shared';

const staticChecker = new StaticChecker();

// state should map to tokenizer state
export enum LGCursorState {
  ROOT = 'root',
  TEMPLATENAME = 'template_name',
  TEMPLATEBODY = 'template_body',
  COMMENTS = 'comments',
  FENCEBLOCK = 'fence_block',
  EXPRESSION = 'expression',
  STRUCTURELG = 'structure_lg',
  SINGLE = 'single',
  DOUBLE = 'double',
}

export interface LGOption {
  projectId: string;
  fileId: string;
  templateId: string;
}

export interface Template {
  name: string;
  parameters?: string[];
  body: string;
}

export interface LGDocument {
  uri: string;
  projectId?: string;
  fileId?: string;
  templateId?: string;
  index: () => LgParsed;
}

export interface LGParsedResource {
  templates: LgTemplate[];
  diagnostics: Diagnostic[];
}

export type LGFileResolver = (id: string) => LgFile | undefined;

export function getRangeAtPosition(document: TextDocument, position: Position): Range | undefined {
  const text = document.getText();
  const line = position.line;
  const pos = position.character;
  const lineText = text.split('\n')[line];
  let match: RegExpMatchArray | null;
  const wordDefinition = /[a-zA-Z0-9_/.-]+/g;
  while ((match = wordDefinition.exec(lineText))) {
    const matchIndex = match.index || 0;
    if (matchIndex > pos) {
      return undefined;
    } else if (wordDefinition.lastIndex >= pos) {
      return Range.create(line, matchIndex, line, wordDefinition.lastIndex);
    }
  }

  return undefined;
}

const severityMap = {
  [LGDiagnosticSeverity.Error]: DiagnosticSeverity.Error,
  [LGDiagnosticSeverity.Hint]: DiagnosticSeverity.Hint,
  [LGDiagnosticSeverity.Information]: DiagnosticSeverity.Information,
  [LGDiagnosticSeverity.Warning]: DiagnosticSeverity.Warning,
};

export function convertSeverity(severity: LGDiagnosticSeverity): DiagnosticSeverity {
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

// if template, offset +1 to exclude #TemplateName
export function convertDiagnostics(lgDiags: BFDiagnostic[] = [], document: TextDocument, offset = 0): Diagnostic[] {
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

export function checkTemplate(template: Template): LGDiagnostic[] {
  const text = textFromTemplate(template);
  return staticChecker.checkText(text, '', ImportResolver.fileResolver).filter(diagnostic => {
    // ignore non-exist references in template body.
    return diagnostic.message.includes('does not have an evaluator') === false;
  });
}

export function updateTemplate(content: string, name: string, body: string): string {
  const resource = LGParser.parse(content);
  const template = resource.templates.find(t => t.name === name);
  // add if not exist
  if (!template) {
    return resource.addTemplate(name, [], body).toString();
  } else {
    return resource.updateTemplate(name, name, template.parameters, body).toString();
  }
}
