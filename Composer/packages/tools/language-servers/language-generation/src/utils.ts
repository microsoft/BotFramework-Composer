import { TextDocument, Range, Position, DiagnosticSeverity } from 'vscode-languageserver-types';

import * as lg from 'botbuilder-lg';

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
