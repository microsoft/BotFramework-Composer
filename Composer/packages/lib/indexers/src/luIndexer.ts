// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { sectionHandler } from '@bfcomposer/bf-lu/lib/parser';

import { FileInfo, LuFile, LuParsed, LuSectionTypes } from './type';
import { getBaseName } from './utils/help';
import { Diagnostic, Position, Range, DiagnosticSeverity } from './diagnostic';
import { FileExtensions } from './utils/fileExtensions';

const { luParser } = sectionHandler;

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

function parse(content: string, id = ''): LuParsed {
  const { Sections, Errors } = luParser.parse(content);
  const intents = Sections.map(section => {
    const { Name, Body, SectionType } = section;
    if (SectionType === LuSectionTypes.SIMPLEINTENTSECTION) {
      const Entities = section.Entities.map(({ Name }) => Name);
      return {
        range: { startLineNumber: section.ParseTree.start.line, endLineNumber: section.ParseTree.stop.line },
        Name,
        Body,
        Entities,
      };
    } else if (SectionType === LuSectionTypes.NESTEDINTENTSECTION) {
      const Children = section.SimpleIntentSections.map(subSection => {
        const { Name, Body } = subSection;
        const Entities = subSection.Entities.map(({ Name }) => Name);
        return {
          Name,
          Body,
          Entities,
        };
      });
      return {
        range: { startLineNumber: section.ParseTree.start.line, endLineNumber: section.ParseTree.stop.line },
        Name,
        Body,
        Children,
      };
    }
  }).filter(item => item !== undefined);
  const diagnostics = Errors.map(e => convertLuDiagnostic(e, id));
  return {
    intents,
    diagnostics,
  };
}

function index(files: FileInfo[]): LuFile[] {
  if (files.length === 0) return [];

  const filtered = files.filter(file => file.name.endsWith(FileExtensions.Lu));

  const luFiles = filtered.map(file => {
    const { name, content, relativePath } = file;
    const id = getBaseName(name);
    const { intents, diagnostics } = parse(content, id);
    return { id, relativePath, content, intents, diagnostics };
  });

  return luFiles;
}

export const luIndexer = {
  index,
  parse,
};
