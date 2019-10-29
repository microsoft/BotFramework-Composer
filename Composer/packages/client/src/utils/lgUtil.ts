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
