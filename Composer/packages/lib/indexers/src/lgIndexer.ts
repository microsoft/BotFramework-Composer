// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LGParser, StaticChecker, Diagnostic as LGDiagnostic, ImportResolver } from 'botbuilder-lg';

import { FileInfo, LgFile, LgTemplate } from './type';
import { getBaseName } from './utils/help';
import { Diagnostic, DiagnosticSeverity, Position, Range } from './diagnostic';

const lgStaticChecker = new StaticChecker();

// NOTE: LGDiagnostic is defined in PascalCase which should be corrected
function convertLGDiagnostic(d: LGDiagnostic, source: string): Diagnostic {
  const result = new Diagnostic(d.Message, source, d.Severity);

  const start: Position = new Position(d.Range.Start.Line, d.Range.Start.Character);
  const end: Position = new Position(d.Range.End.Line, d.Range.End.Character);
  result.range = new Range(start, end);

  return result;
}

function check(content: string, id: string, path?: string): Diagnostic[] {
  const lgImportResolver = ImportResolver.fileResolver;
  let diagnostics: LGDiagnostic[] = [];
  if (path) {
    diagnostics = lgStaticChecker.checkText(content, path);
  } else {
    diagnostics = lgStaticChecker.checkText(content, path, lgImportResolver);
  }
  return diagnostics.map((d: LGDiagnostic) => {
    return convertLGDiagnostic(d, id);
  });
}

function parse(content: string, id?: string): LgTemplate[] {
  const resource = LGParser.parse(content, id);
  const templates = resource.Templates.map(t => {
    return {
      Name: t.Name,
      Body: t.Body,
      Parameters: t.Parameters,
    };
  });
  return templates;
}

function index(files: FileInfo[]): LgFile[] {
  if (files.length === 0) return [];
  const lgFiles: LgFile[] = [];
  for (const file of files) {
    const { name, relativePath, content } = file;
    if (name.endsWith('.lg')) {
      const id = getBaseName(name, '.lg');
      const diagnostics = check(content, id);
      let templates: LgTemplate[] = [];
      try {
        templates = parse(file.content, '');
      } catch (err) {
        diagnostics.push(new Diagnostic(err.message, id, DiagnosticSeverity.Error));
      }
      lgFiles.push({ id, relativePath, content, templates, diagnostics });
    }
  }
  return lgFiles;
}

function isValid(diagnostics: Diagnostic[]): boolean {
  return diagnostics.every(d => d.severity !== DiagnosticSeverity.Error);
}

function createSingleMessage(d: Diagnostic): string {
  let msg = `${d.message}\n`;
  if (d.range) {
    const { start, end } = d.range;
    const position = `line ${start.line}:${start.character} - line ${end.line}:${end.character}`;
    msg += `${position} \n ${msg}`;
  }
  return msg;
}

function combineMessage(diagnostics: Diagnostic[]): string {
  return diagnostics.reduce((msg, d) => {
    msg += createSingleMessage(d);
    return msg;
  }, '');
}

export const lgIndexer = {
  index,
  parse,
  check,
  isValid,
  createSingleMessage,
  combineMessage,
};
