// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import LUParser from '@microsoft/bf-lu/lib/parser/lufile/luParser';
import { FileInfo, QnAFile } from '@bfc/shared';
import isEmpty from 'lodash/isEmpty';
import { Diagnostic, Position, Range, DiagnosticSeverity } from '@bfc/shared';
import { nanoid } from 'nanoid';

import { getBaseName } from './utils/help';
import { FileExtensions } from './utils/fileExtensions';

enum SectionTypes {
  QnASection = 'qnaSection',
  ImportSection = 'importSection',
  LUModelInfo = 'modelInfoSection',
}

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

function parse(content: string, id = ''): QnAFile {
  const result = LUParser.parse(content);
  const qnaSections = result.Sections.filter(({ SectionType }) => SectionType === SectionTypes.QnASection).map(
    (section) => {
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
      const range = new Range(
        new Position(section.Range.Start.Line, section.Range.Start.Character),
        new Position(section.Range.End.Line, section.Range.End.Character)
      );
      const QuestionsWithId = Questions.map((Q) => {
        return {
          content: Q,
          id: nanoid(6),
        };
      });

      return {
        Answer,
        Body,
        FilterPairs,
        Id,
        QAPairId,
        Questions: QuestionsWithId,
        SectionType,
        StartLine,
        StopLine,
        prompts,
        promptsText,
        source,
        range,
        uuid: nanoid(6),
      };
    }
  );

  const imports = result.Sections.filter(({ SectionType }) => SectionType === SectionTypes.ImportSection).map(
    ({ Path }) => Path
  );

  const infos = result.Sections.filter(({ SectionType }) => SectionType === SectionTypes.LUModelInfo).map(
    ({ ModelInfo }) => ModelInfo
  );

  const diagnostics = result.Errors.map((e) => convertQnADiagnostic(e, id));
  return {
    id,
    content,
    imports,
    infos,
    empty: isEmpty(result.Sections),
    qnaSections,
    fileId: id,
    diagnostics,
  };
}

function index(files: FileInfo[]): QnAFile[] {
  if (files.length === 0) return [];
  const qnaFiles: QnAFile[] = [];
  for (const file of files) {
    const { name, content } = file;
    if (name.endsWith(FileExtensions.QnA)) {
      const id = getBaseName(name, FileExtensions.QnA);
      const data = parse(content, id);
      qnaFiles.push(data);
    }
  }
  return qnaFiles;
}

export const qnaIndexer = {
  index,
  parse,
};
