// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { parser } from '@bfcomposer/bf-lu/lib/parser';

import { FileInfo, LuFile, IParsedObject } from './type';
import { getBaseName } from './utils/help';
import { Diagnostic, Position, Range, DiagnosticSeverity } from './diagnostic';
import { FileExtensions } from './utils/fileExtensions';

function convertLuDiagnostic(d: any, source: string): Diagnostic {
  const severityMap = {
    ERROR: DiagnosticSeverity.Error,
    WARNING: DiagnosticSeverity.Warning,
    INFORMATION: DiagnosticSeverity.Information,
    HINT: DiagnosticSeverity.Hint,
  };
  const result = new Diagnostic(d.Message, source, severityMap[d.Severity]);

  const start: Position = new Position(d.Range.Start.Line, d.Range.Start.Character);
  const end: Position = new Position(d.Range.End.Line, d.Range.End.Character);
  result.range = new Range(start, end);

  return result;
}

function parse(content: string): Promise<IParsedObject> {
  const log = false;
  const locale = 'en-us';

  return parser.parseFile(content, log, locale);
}

async function index(files: FileInfo[]): Promise<LuFile[]> {
  if (files.length === 0) return [];

  const filtered = files.filter(file => file.name.endsWith(FileExtensions.Lu));

  const luFiles = await Promise.all(
    filtered.map(async file => {
      const { name, content, relativePath } = file;
      const diagnostics: Diagnostic[] = [];
      let parsedContent: IParsedObject | undefined;

      try {
        parsedContent = await parse(file.content);
      } catch (err) {
        err.diagnostics.forEach(diagnostic => {
          diagnostics.push(convertLuDiagnostic(diagnostic, name));
        });
      }

      return { diagnostics, id: getBaseName(name), relativePath, content, parsedContent };
    })
  );

  return luFiles;
}

export const luIndexer = {
  index,
  parse,
};
