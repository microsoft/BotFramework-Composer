import { TextDocument, Range, Position, DiagnosticSeverity } from 'vscode-languageserver-types';

import { LGResource, LGParser, DiagnosticSeverity as LGDiagnosticSeverity } from 'botbuilder-lg';

import get from 'lodash.get';

export function getRangeAtPosition(document: TextDocument, position: Position): Range | undefined {
  let range: Range;
  const text = document.getText();
  const line = position.line;
  const character = position.character;
  const lineText = text.split('\n')[line];
  let lastIdx = -1;
  let start: number = -1;
  let end: number = -1;
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

export function convertSeverity(severity: LGDiagnosticSeverity): DiagnosticSeverity {
  switch (severity) {
    case LGDiagnosticSeverity.Error:
      return DiagnosticSeverity.Error;
    case LGDiagnosticSeverity.Hint:
      return DiagnosticSeverity.Hint;
    case LGDiagnosticSeverity.Information:
      return DiagnosticSeverity.Information;
    case LGDiagnosticSeverity.Warning:
      return DiagnosticSeverity.Warning;
  }
}

export function getLGResources(content: string): LGResource {
  return LGParser.parse(content, ' ');
}

export function getTemplatePositionOffset(content: string, { Name, Body }): number {
  const resource = LGParser.parse(content).updateTemplate(Name, Name, [], Body);
  const template = resource.Templates.find(item => item.Name === Name);
  const templateStartLine = get(template, 'ParseTree._start.line', 0);
  return templateStartLine;
}

export function updateTemplateInContent(content: string, { Name, Body }): string {
  const resource = LGParser.parse(content);
  return resource.updateTemplate(Name, Name, [], Body).toString();
}
