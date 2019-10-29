/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
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
