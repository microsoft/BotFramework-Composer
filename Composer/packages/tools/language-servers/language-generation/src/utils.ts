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
  content: string;
  template: Template;
}

export function getRangeAtPosition(document: TextDocument, position: Position): Range | undefined {
  let range: Range;
  const text = document.getText();
  const line = position.line;
  const character = position.character;
  const lineText = text.split('\n')[line];
  let lastIdx = -1;
  let start = -1;
  let end = -1;
  const regex = /[a-zA-Z0-9_/.]+/;
  for (let idx = 0; idx < lineText.length; idx++) {
    if (!regex.test(lineText[idx])) {
      if (idx > character && character > lastIdx) {
        start = lastIdx + 1;
        end = idx;
        break;
      } else {
        lastIdx = idx;
      }
    }
    if (idx === lineText.length - 1) {
      start = lineText.lastIndexOf(' ') + 1;
      end = idx + 1;
    }
  }

  if (start < 0 || end < 0) {
    return;
  } else {
    range = Range.create(line, start, line, end);
  }

  return range;
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
  return staticChecker.checkText(text, '', ImportResolver.fileResolver);
}

export function checkText(text: string): LGDiagnostic[] {
  return staticChecker.checkText(text, '', ImportResolver.fileResolver);
}
export function isValid(diagnostics: LGDiagnostic[]): boolean {
  return diagnostics.every(d => d.Severity !== DiagnosticSeverity.Error);
}

export function getLGResources(content: string): LGResource {
  return LGParser.parse(content, ' ');
}

export function getTemplatePositionOffset(content: string, { Name, Parameters = [], Body }: Template): number {
  const resource = LGParser.parse(content).updateTemplate(Name, Name, Parameters, Body);
  const template = resource.Templates.find(item => item.Name === Name);
  const templateStartLine = get(template, 'ParseTree._start.line', 0);
  return templateStartLine;
}

export function updateTemplateInContent(content: string, { Name, Parameters = [], Body }: Template): string {
  const resource = LGParser.parse(content);
  return resource.updateTemplate(Name, Name, Parameters, Body).toString();
}
