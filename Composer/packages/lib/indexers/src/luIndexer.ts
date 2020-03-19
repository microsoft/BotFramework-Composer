// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { sectionHandler } from '@microsoft/bf-lu/lib/parser/composerindex';
import get from 'lodash/get';
import {
  FileInfo,
  LuFile,
  LuParsed,
  LuSectionTypes,
  LuIntentSection,
  Diagnostic,
  Position,
  Range,
  DiagnosticSeverity,
} from '@bfc/shared';

import { getBaseName } from './utils/help';
import { FileExtensions } from './utils/fileExtensions';

const { luParser } = sectionHandler;

function convertLuDiagnostic(d: any, source: string): Diagnostic {
  const severityMap = {
    ERROR: DiagnosticSeverity.Error,
    WARN: DiagnosticSeverity.Warning,
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
  const intents: LuIntentSection[] = [];
  Sections.forEach(section => {
    const { Name, Body, SectionType } = section;
    const range = {
      startLineNumber: get(section, 'ParseTree.start.line', 0),
      endLineNumber: get(section, 'ParseTree.stop.line', 0),
    };
    if (SectionType === LuSectionTypes.SIMPLEINTENTSECTION) {
      const Entities = section.Entities.map(({ Name }) => Name);
      intents.push({
        Name,
        Body,
        Entities,
        range,
      });
    } else if (SectionType === LuSectionTypes.NESTEDINTENTSECTION) {
      const Children = section.SimpleIntentSections.map(subSection => {
        const { Name, Body } = subSection;
        const range = {
          startLineNumber: get(subSection, 'ParseTree.start.line', 0),
          endLineNumber: get(subSection, 'ParseTree.stop.line', 0),
        };
        const Entities = subSection.Entities.map(({ Name }) => Name);
        return {
          Name,
          Body,
          Entities,
          range,
        };
      });
      intents.push({
        Name,
        Body,
        Children,
        range,
      });
      intents.push(
        ...Children.map(subSection => {
          return {
            ...subSection,
            Name: `${section.Name}/${subSection.Name}`,
          };
        })
      );
    }
  });
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
    return { id, relativePath, content, intents, diagnostics, lastModified: file.lastModified };
  });

  return luFiles;
}

export const luIndexer = {
  index,
  parse,
};
