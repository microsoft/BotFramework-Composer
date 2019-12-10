// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TextDocument, Range, Position, DiagnosticSeverity, Diagnostic } from 'vscode-languageserver-types';
import {
  LGResource,
  LGParser,
  DiagnosticSeverity as LGDiagnosticSeverity,
  ImportResolver,
  Diagnostic as LGDiagnostic,
  StaticChecker,
} from 'botbuilder-lg';
import get from 'lodash/get';

const staticChecker = new StaticChecker();

export interface Template {
  name: string;
  parameters?: string[];
  body: string;
}

export interface TRange {
  startLineNumber: number;
  endLineNumber: number;
}

export interface LGDocument {
  uri: string;
  inline: boolean;
  content?: string;
  template?: Template;
}

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

export function convertDiagnostics(lgDiags: LGDiagnostic[] = [], document: TextDocument, lineOffset = 0): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  lgDiags.forEach(diag => {
    const diagnostic: Diagnostic = {
      severity: convertSeverity(diag.severity),
      range: Range.create(
        Position.create(diag.range.start.line - 1 - lineOffset, diag.range.start.character),
        Position.create(diag.range.end.line - 1 - lineOffset, diag.range.end.character)
      ),
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

export function textFromTemplates(templates: Template[]): string {
  return templates
    .map(template => {
      return textFromTemplate(template);
    })
    .join('\n');
}

export function checkTemplate(template: Template): LGDiagnostic[] {
  const text = textFromTemplate(template);
  return staticChecker.checkText(text, '', ImportResolver.fileResolver).filter(diagnostic => {
    // ignore non-exist references in template body.
    return diagnostic.message.includes('does not have an evaluator') === false;
  });
}

export function checkText(text: string): LGDiagnostic[] {
  return staticChecker.checkText(text, '', ImportResolver.fileResolver);
}
export function isValid(diagnostics: LGDiagnostic[]): boolean {
  return diagnostics.every(d => d.severity !== LGDiagnosticSeverity.Error);
}

export function getLGResources(content: string): LGResource {
  return LGParser.parse(content, ' ');
}

export function getTemplateRange(content: string, { name, parameters = [], body }: Template): TRange {
  const resource = LGParser.parse(content).updateTemplate(name, name, parameters, body);
  const template = resource.templates.find(item => item.name === name);
  return {
    startLineNumber: get(template, 'parseTree.start.line', 0),
    endLineNumber: get(template, 'parseTree.stop.line', 0),
  };
}

export function updateTemplateInContent(content: string, { name, parameters = [], body }: Template): string {
  const resource = LGParser.parse(content);
  return resource.updateTemplate(name, name, parameters, body).toString();
}
