import { TextDocument, Range, Position, DiagnosticSeverity } from 'vscode-languageserver-types';

import * as lg from 'botbuilder-lg';

export function getRangeAtPosition(document: TextDocument, position: Position): Range {
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

export function convertSeverity(severity: lg.DiagnosticSeverity): DiagnosticSeverity {
  switch (severity) {
    case lg.DiagnosticSeverity.Error:
      return DiagnosticSeverity.Error;
    case lg.DiagnosticSeverity.Hint:
      return DiagnosticSeverity.Hint;
    case lg.DiagnosticSeverity.Information:
      return DiagnosticSeverity.Information;
    case lg.DiagnosticSeverity.Warning:
      return DiagnosticSeverity.Warning;
  }
}

export function getLGResources(document: TextDocument): lg.LGResource {
  return lg.LGParser.parse(document.getText(), ' ');
}
