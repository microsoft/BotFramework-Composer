import { LGParser, StaticChecker, DiagnosticSeverity, ImportResolver } from 'botbuilder-lg';
import { get } from 'lodash';

const lgImportResolver = new ImportResolver();

export function isValid(diagnostics) {
  return diagnostics.every(d => d.Severity !== DiagnosticSeverity.Error);
}

export function check(content, id = '') {
  return StaticChecker.checkText(content, id, lgImportResolver);
}

export function parse(content, id = '') {
  const resource = LGParser.parse(content, id);
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
