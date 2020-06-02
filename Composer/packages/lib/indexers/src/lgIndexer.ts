// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Templates, TemplatesParser, Diagnostic as LGDiagnostic, ImportResolverDelegate } from 'botbuilder-lg';
import get from 'lodash/get';
import { LgFile, FileInfo, Diagnostic, Position, Range } from '@bfc/shared';

import { getBaseName } from './utils/help';

const { defaultFileResolver } = TemplatesParser;

// NOTE: LGDiagnostic is defined in PascalCase which should be corrected
function convertLGDiagnostic(d: LGDiagnostic, source: string): Diagnostic {
  const result = new Diagnostic(d.message, source, d.severity);

  const start: Position = new Position(d.range.start.line, d.range.start.character);
  const end: Position = new Position(d.range.end.line, d.range.end.character);
  result.range = new Range(start, end);

  return result;
}

function parse(content: string, id = '', importResolver: ImportResolverDelegate = defaultFileResolver) {
  const lgFile = Templates.parseText(content, id, importResolver);
  const templates = lgFile.toArray().map((t) => {
    return {
      name: t.name,
      body: t.body,
      parameters: t.parameters,
      range: {
        startLineNumber: get(t, 'parseTree.start.line', 0),
        endLineNumber: get(t, 'parseTree.stop.line', 0),
      },
    };
  });
  const diagnostics = lgFile.diagnostics.map((d: LGDiagnostic) => {
    return convertLGDiagnostic(d, id);
  });
  return { templates, diagnostics, options: lgFile.options };
}

function index(files: FileInfo[], importResolver?: ImportResolverDelegate): LgFile[] {
  if (files.length === 0) return [];
  const lgFiles: LgFile[] = [];
  for (const file of files) {
    const { name, content } = file;
    if (name.endsWith('.lg')) {
      const id = getBaseName(name, '.lg');
      lgFiles.push({ id, content, ...parse(content, id, importResolver) });
    }
  }
  return lgFiles;
}

export const lgIndexer = {
  index,
  parse,
};
