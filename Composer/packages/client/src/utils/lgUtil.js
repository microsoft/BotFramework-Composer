import { LGParser, StaticChecker, DiagnosticSeverity } from 'botbuilder-lg';
import { get } from 'lodash';

export function isValid(diagnostics) {
  return diagnostics.every(d => d.Severity !== DiagnosticSeverity.Error);
}

export function check(content, name = '') {
  return StaticChecker.checkText(content, name);
}

export function parse(content, name = '') {
  const resource = LGParser.parse(content, name);
  return get(resource, 'Templates', []);
}

export function combineMessage(diagnostics) {
  return diagnostics.reduce((msg, d) => {
    const { Start, End } = d.Range;
    const position = `line ${Start.Line}:${Start.Character} - line ${End.Line}:${End.Character}`;

    msg += `${position} \n ${d.Message}\n`;
    return msg;
  }, '');
}
