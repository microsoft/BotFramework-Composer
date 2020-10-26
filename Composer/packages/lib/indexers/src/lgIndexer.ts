// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Templates, TemplatesParser, ImportResolverDelegate } from 'botbuilder-lg';
import { LgFile, FileInfo } from '@bfc/shared';

import { getBaseName } from './utils/help';
import { convertTemplatesToLgFile } from './utils/lgUtil';

const { defaultFileResolver } = TemplatesParser;

function parse(content: string, id = '', importResolver: ImportResolverDelegate = defaultFileResolver) {
  const lgFile = Templates.parseText(content, id, importResolver);
  lgFile.diagnostics = lgFile.diagnostics.filter(
    (diag) => !diag.message.includes('LG file must have at least one template definition.')
  );
  return convertTemplatesToLgFile(id, content, lgFile);
}

function index(files: FileInfo[], importResolver?: ImportResolverDelegate): LgFile[] {
  if (files.length === 0) return [];
  const lgFiles: LgFile[] = [];
  for (const file of files) {
    const { name, content } = file;
    if (name.endsWith('.lg')) {
      const id = getBaseName(name, '.lg');
      const result = parse(content, id, importResolver);
      result.diagnostics = result.diagnostics.filter(
        (diag) => !diag.message.includes('LG file must have at least one template definition.')
      );
      delete result.parseResult;
      lgFiles.push(result);
    }
  }
  return lgFiles;
}

export const lgIndexer = {
  index,
  parse,
};
