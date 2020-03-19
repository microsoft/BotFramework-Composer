// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  LGParser,
  StaticChecker,
  Diagnostic as LGDiagnostic,
  ImportResolver,
  ImportResolverDelegate,
} from 'botbuilder-lg';
import get from 'lodash/get';
import { LgTemplate, LgFile, FileInfo, Diagnostic, DiagnosticSeverity, Position, Range } from '@bfc/shared';

import { getBaseName } from './utils/help';

const lgStaticChecker = new StaticChecker();

// NOTE: LGDiagnostic is defined in PascalCase which should be corrected
function convertLGDiagnostic(d: LGDiagnostic, source: string): Diagnostic {
  const result = new Diagnostic(d.message, source, d.severity);

  const start: Position = new Position(d.range.start.line, d.range.start.character);
  const end: Position = new Position(d.range.end.line, d.range.end.character);
  result.range = new Range(start, end);

  return result;
}

function check(content: string, id: string, importResolver?: ImportResolverDelegate): Diagnostic[] {
  const resolver: ImportResolverDelegate = importResolver || ImportResolver.fileResolver;
  let diagnostics: LGDiagnostic[] = [];

  diagnostics = lgStaticChecker.checkText(content, id, resolver);

  return diagnostics.map((d: LGDiagnostic) => {
    return convertLGDiagnostic(d, id);
  });
}

function parse(content: string, id?: string): LgTemplate[] {
  const resource = LGParser.parse(content, id);
  const templates = resource.templates.map(t => {
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
  return templates;
}

function index(files: FileInfo[], importResolver?: ImportResolverDelegate): LgFile[] {
  if (files.length === 0) return [];
  const lgFiles: LgFile[] = [];
  for (const file of files) {
    const { name, relativePath, content } = file;
    if (name.endsWith('.lg')) {
      const id = getBaseName(name, '.lg');
      const diagnostics = check(content, id, importResolver);
      let templates: LgTemplate[] = [];
      try {
        templates = parse(file.content, id);
      } catch (err) {
        diagnostics.push(new Diagnostic(err.message, id, DiagnosticSeverity.Error));
      }
      lgFiles.push({ id, content, relativePath, templates, diagnostics, lastModified: file.lastModified });
    }
  }
  return lgFiles;
}

export const lgIndexer = {
  index,
  parse,
  check,
};
