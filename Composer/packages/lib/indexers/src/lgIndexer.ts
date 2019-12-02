// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LGParser, StaticChecker, DiagnosticSeverity, Diagnostic } from 'botbuilder-lg';
import get from 'lodash/get';

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
  return diagnostics.every(d => d.severity !== DiagnosticSeverity.Error);
}

function check(content: string, path: string): Diagnostic[] {
  return lgStaticChecker.checkText(content, path);
}

function parse(content: string, id: string): LgTemplate[] {
  const resource = LGParser.parse(content, id);
  const templates = resource.templates.map(t => {
    return {
      name: t.name,
      body: t.body,
      parameters: t.parameters,
      range: {
        startLineNumber: get(t, 'parseTree._start._line', 0),
        endLineNumber: get(t, 'parseTree._stop._line', 0),
      },
    };
  });
  return templates;
}

function combineMessage(diagnostics: Diagnostic[]): string {
  return diagnostics.reduce((msg, d) => {
    const { start, end } = d.range;
    const position = `line ${start.line}:${start.character} - line ${end.line}:${end.character}`;

    msg += `${position} \n ${d.message}\n`;
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
