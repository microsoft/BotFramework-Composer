// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import LUParser from '@microsoft/bf-lu/lib/parser/lufile/luParser';
import { FileInfo, QnAFile } from '@bfc/shared';
import get from 'lodash/get';
import { Diagnostic, Position, Range, DiagnosticSeverity } from '@bfc/shared';

import { getBaseName } from './utils/help';
import { FileExtensions } from './utils/fileExtensions';

function convertQnADiagnostic(d: any, source: string): Diagnostic {
  const severityMap = {
    ERROR: DiagnosticSeverity.Error,
    WARN: DiagnosticSeverity.Warning,
    INFORMATION: DiagnosticSeverity.Information,
    HINT: DiagnosticSeverity.Hint,
  };
  const result = new Diagnostic(d.Message, source, severityMap[d.Severity]);

  const start: Position = d.Range ? new Position(d.Range.Start.Line, d.Range.Start.Character) : new Position(0, 0);
  const end: Position = d.Range ? new Position(d.Range.End.Line, d.Range.End.Character) : new Position(0, 0);
  result.range = new Range(start, end);

  return result;
}

function parse(content: string, id = '') {
  const { Sections, Errors } = LUParser.parse(content);
  const qnaPairs: any[] = [];
  Sections.forEach((section) => {
    const {
      Answer,
      Body,
      FilterPairs,
      Id,
      QAPairId,
      Questions,
      SectionType,
      StartLine,
      StopLine,
      prompts,
      promptsText,
      source,
    } = section;
    const range = {
      startLineNumber: get(section, 'ParseTree.start.line', 0),
      endLineNumber: get(section, 'ParseTree.stop.line', 0),
    };
    qnaPairs.push({
      Answer,
      Body,
      FilterPairs,
      Id,
      QAPairId,
      Questions,
      SectionType,
      StartLine,
      StopLine,
      prompts,
      promptsText,
      source,
      range,
    });
  });
  const diagnostics = Errors.map((e) => convertQnADiagnostic(e, id));
  return {
    empty: !Sections.length,
    qnaPairs,
    fileId: id,
    diagnostics,
  };
}

function index(files: FileInfo[]): QnAFile[] {
  if (files.length === 0) return [];
  const qnaFiles: QnAFile[] = [];
  for (const file of files) {
    const { name, content } = file;
    if (name.endsWith(FileExtensions.Qna)) {
      const id = getBaseName(name, FileExtensions.Qna);
      const data = parse(content, id);
      qnaFiles.push({ id, content, ...data });
    }
  }
  return qnaFiles;
}

export const qnaIndexer = {
  index,
  parse,
};
