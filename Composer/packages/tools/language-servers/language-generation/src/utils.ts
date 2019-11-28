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
  Name: string;
  Parameters?: string[];
  Body: string;
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
  const wordDefinition = /[a-zA-Z0-9_/-/.]+/g;
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
      severity: convertSeverity(diag.Severity),
      range: Range.create(
        Position.create(diag.Range.Start.Line - 1 - lineOffset, diag.Range.Start.Character),
        Position.create(diag.Range.End.Line - 1 - lineOffset, diag.Range.End.Character)
      ),
      message: diag.Message,
      source: document.uri,
    };
    diagnostics.push(diagnostic);
  });
  return diagnostics;
}

export function textFromTemplate(template: Template): string {
  let text = '';
  if (template.Name && (template.Body !== null && template.Body !== undefined)) {
    text += `# ${template.Name.trim()}`;
    if (template.Parameters && template.Parameters.length > 0) {
      text += '(' + template.Parameters.join(', ') + ')';
    }
    text += '\n';
    text += `${template.Body.trim()}`;
  }
  return text;
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
    return diagnostic.Message.includes('does not have an evaluator') === false;
  });
}

export function checkText(text: string): LGDiagnostic[] {
  return staticChecker.checkText(text, '', ImportResolver.fileResolver);
}
export function isValid(diagnostics: LGDiagnostic[]): boolean {
  return diagnostics.every(d => d.Severity !== LGDiagnosticSeverity.Error);
}

export function getLGResources(content: string): LGResource {
  return LGParser.parse(content, ' ');
}

export function getTemplatePositionOffset(content: string, { Name, Parameters = [], Body }: Template): number {
  const resource = LGParser.parse(content).updateTemplate(Name, Name, Parameters, Body);
  const template = resource.Templates.find(item => item.Name === Name);
  return get(template, 'ParseTree._start.line', 0);
}

export function updateTemplateInContent(content: string, { Name, Parameters = [], Body }: Template): string {
  const resource = LGParser.parse(content);
  return resource.updateTemplate(Name, Name, Parameters, Body).toString();
}
