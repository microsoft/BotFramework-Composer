import { LGParser, StaticChecker, DiagnosticSeverity, Diagnostic } from 'botbuilder-lg';
import get from 'lodash.get';

import { FileInfo, LgFile, LgTemplate } from './type';
import { getBaseName } from './utils/help';

const lgStaticChecker = new StaticChecker();

function index(files: FileInfo[]): LgFile[] {
  if (files.length === 0) return [];
  const lgFiles: LgFile[] = [];
  for (const file of files) {
    if (file.name.endsWith('.lg')) {
      const diagnostics = lgStaticChecker.checkText(file.content, file.path);
      let templates: LgTemplate[] = [];
      try {
        templates = parse(file.content, '');
      } catch (err) {
        console.error(err);
      }
      lgFiles.push({
        id: getBaseName(file.name, '.lg'),
        relativePath: file.relativePath,
        content: file.content,
        templates,
        diagnostics,
      });
    }
  }
  return lgFiles;
}

function isValid(diagnostics: Diagnostic[]): boolean {
  return diagnostics.every(d => d.Severity !== DiagnosticSeverity.Error);
}

function check(content: string, path: string): Diagnostic[] {
  return lgStaticChecker.checkText(content, path);
}

function parse(content: string, id: string): LgTemplate[] {
  const resource = LGParser.parse(content, id);
  const templates = resource.Templates.map(t => {
    return {
      Name: t.Name,
      Body: t.Body,
      Parameters: t.Parameters,
      Range: {
        startLineNumber: get(t, 'ParseTree._start._line', 0),
        endLineNumber: get(t, 'ParseTree._stop._line', 0),
      },
    };
  });
  return templates;
}

function combineMessage(diagnostics: Diagnostic[]): string {
  return diagnostics.reduce((msg, d) => {
    const { Start, End } = d.Range;
    const position = `line ${Start.Line}:${Start.Character} - line ${End.Line}:${End.Character}`;

    msg += `${position} \n ${d.Message}\n`;
    return msg;
  }, '');
}

export const lgIndexer = {
  index,
  parse,
  check,
  isValid,
  combineMessage,
};
