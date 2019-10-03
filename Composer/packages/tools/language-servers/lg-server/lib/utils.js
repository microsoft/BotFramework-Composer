'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const vscode_languageserver_types_1 = require('vscode-languageserver-types');
const lg = require('botbuilder-lg');
function getRangeAtPosition(document, position) {
  let range;
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
    range = vscode_languageserver_types_1.Range.create(line, start, line, end);
  }
  return range;
}
exports.getRangeAtPosition = getRangeAtPosition;
function convertSeverity(severity) {
  switch (severity) {
    case lg.DiagnosticSeverity.Error:
      return vscode_languageserver_types_1.DiagnosticSeverity.Error;
    case lg.DiagnosticSeverity.Hint:
      return vscode_languageserver_types_1.DiagnosticSeverity.Hint;
    case lg.DiagnosticSeverity.Information:
      return vscode_languageserver_types_1.DiagnosticSeverity.Information;
    case lg.DiagnosticSeverity.Warning:
      return vscode_languageserver_types_1.DiagnosticSeverity.Warning;
  }
}
exports.convertSeverity = convertSeverity;
function getLGResources(document) {
  return lg.LGParser.parse(document.getText(), ' ');
}
exports.getLGResources = getLGResources;
//# sourceMappingURL=utils.js.map
