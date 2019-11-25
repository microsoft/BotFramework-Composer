// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TextDocument, Range, Position, DiagnosticSeverity } from 'vscode-languageserver-types';
import { LGResource, LGParser, DiagnosticSeverity as LGDiagnosticSeverity } from 'botbuilder-lg';
import get from 'lodash/get';

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
