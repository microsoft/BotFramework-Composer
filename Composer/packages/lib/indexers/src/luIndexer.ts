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
import ludown from 'ludown';

import { FileInfo, LuFile, LuDiagnostic } from './type';
import { getBaseName } from './utils/help';

async function index(files: FileInfo[]) {
  if (files.length === 0) return [];
  const luFiles: LuFile[] = [];
  for (const file of files) {
    if (file.name.endsWith('.lu')) {
      const diagnostics: LuDiagnostic[] = [];
      let parsedContent: any = {};
      try {
        parsedContent = await parse(file.content);
      } catch (err) {
        diagnostics.push(err);
      }
      luFiles.push({
        diagnostics,
        id: getBaseName(file.name, '.lu'),
        relativePath: file.relativePath,
        content: file.content,
        parsedContent,
      });
    }
  }
  return luFiles;
}

function parse(content: string): Promise<any> {
  const log = false;
  const locale = 'en-us';

  return ludown.parser.parseFile(content, log, locale);
}

export const luIndexer = {
  index,
  parse,
};
