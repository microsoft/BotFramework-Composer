import { LGParser, StaticChecker, DiagnosticSeverity, ImportResolver, Diagnostic, LGTemplate } from 'botbuilder-lg';
import { get } from 'lodash';

const lgStaticChecker = new StaticChecker();

const lgImportResolver = new ImportResolver();

export function isValid(diagnostics: Diagnostic[]): boolean {
  return diagnostics.every(d => d.Severity !== DiagnosticSeverity.Error);
}

export function check(content: string, id = ''): Diagnostic[] {
  // @ts-ignore
  return lgStaticChecker.checkText(content, id, lgImportResolver);
}

export function parse(content: string, id = ''): LGTemplate[] {
  const resource = LGParser.parse(content, id);
  return get(resource, 'Templates', []);
}

export function combineMessage(diagnostics: Diagnostic[]): string {
  return diagnostics.reduce((msg, d) => {
    const { Start, End } = d.Range;
    const position = `line ${Start.Line}:${Start.Character} - line ${End.Line}:${End.Character}`;

    msg += `${position} \n ${d.Message}\n`;
    return msg;
  }, '');
}
