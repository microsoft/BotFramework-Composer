// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * qnaUtil.ts is a single place handle qna file operation.
 * it's designed have no state, input text file, output text file.
 */

//import isEmpty from 'lodash/isEmpty';
import { QnAFile } from '@bfc/shared';
import { sectionHandler } from '@microsoft/bf-lu/lib/parser/composerindex';
import isEmpty from 'lodash/isEmpty';
import { Diagnostic, Position, Range, DiagnosticSeverity, LuParseResource } from '@bfc/shared';
import { nanoid } from 'nanoid';

import { getFileName } from './help';

const { luParser, sectionOperator } = sectionHandler;

const NEWLINE = '\n';

export enum SectionTypes {
  QnASection = 'qnaSection',
  ImportSection = 'importSection',
  LUModelInfo = 'modelInfoSection',
}

function rebuildQnaSection(qnaSection) {
  const { source, QAPairId, Questions, FilterPairs, Answer, promptsText } = qnaSection;
  let result = '';
  if (source && source !== 'custom editorial') {
    result += `> !# @qna.pair.source = ${source}\n`;
  }
  if (QAPairId) {
    result += `<a id = "${QAPairId}"></a>\n`;
  }
  result += `# ? `;
  if (Questions && Questions.length !== 0) {
    result += `${Questions[0].content}`;
    Questions.slice(1).forEach((question) => {
      result += `\n- ${question.content}`;
    });
  }
  if (FilterPairs && FilterPairs.length !== 0) {
    result += `\n**Filters:**`;
    FilterPairs.forEach((filterPair) => {
      result += `\n-${filterPair.key}=${filterPair.value}`;
    });
  }
  result += '\n```';
  if (Answer) {
    result += `\n${Answer}`;
  } else {
    result += `\n`;
  }
  result += '\n```';
  if (promptsText) {
    result += '\n**Prompts:**';
    promptsText.forEach((prompt) => {
      result += `\n-${prompt}`;
    });
  }
  return result;
}

export function convertQnADiagnostic(d: any, source: string): Diagnostic {
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

function convertLURange(section: any): Range {
  const start: Position = new Position(section.Range.Start.Line, section.Range.Start.Character);
  const end: Position = new Position(section.Range.End.Line, section.Range.End.Character);

  return new Range(start, end);
}

export function convertQnAParseResultToQnAFile(id = '', resource: LuParseResource): QnAFile {
  // attach uniq id for CRUD.
  // TODO: persistence uniq id when do re-parse.
  const Sections = resource.Sections.map((item) => {
    return {
      ...item,
      sectionId: nanoid(8),
    };
  });
  // filter structured-object from LUParser result.
  const { Errors, Content } = resource;
  const qnaSections = Sections.filter(({ SectionType }) => SectionType === SectionTypes.QnASection).map((section) => {
    const { Answer, Body, sectionId, Questions } = section;
    const QuestionsWithId = Questions.map((content) => {
      return {
        content,
        id: nanoid(8),
      };
    });

    return {
      Body,
      sectionId,
      Answer,
      Questions: QuestionsWithId,
      range: convertLURange(section),
    };
  });

  const imports = Sections.filter(({ SectionType }) => SectionType === SectionTypes.ImportSection).map(
    ({ Path, Description }) => {
      return {
        id: getFileName(Path),
        description: Description,
        path: Path,
      };
    }
  );

  const optionRegExp = new RegExp(/@source\.(\w+)\s*=\s*(.*)/);
  const options: { id: string; name: string; value: string }[] = [];
  Sections.filter(({ SectionType }) => SectionType === SectionTypes.LUModelInfo).forEach(({ ModelInfo, Id }) => {
    const match = ModelInfo.match(optionRegExp);
    if (match) {
      options.push({
        id: Id,
        name: match[1],
        value: match[2],
      });
    }
  });

  const diagnostics = Errors.map((e) => convertQnADiagnostic(e, id));
  return {
    id,
    content: Content,
    empty: isEmpty(Sections),
    qnaSections,
    diagnostics,
    resource: { Sections, Errors, Content },
    imports,
    options,
    isContentUnparsed: false,
  };
}

export function checkIsSingleSection(content: string) {
  const { Sections } = luParser.parse(content);
  return Sections.length === 1;
}

// export function generateQnAPair(question = 'default question', body = 'defualt body') {
export function generateQnAPair(question = '', body = '') {
  return `# ? ${question}\n\`\`\`\n${body}\n\`\`\``;
}

export function addSection(qnaFile: QnAFile, sectionContent: string): QnAFile {
  const { resource } = qnaFile;

  const result = new sectionOperator(resource).addSection(NEWLINE + sectionContent);
  return convertQnAParseResultToQnAFile(qnaFile.id, result);
}

export function updateSection(qnaFile: QnAFile, sectionId: string, sectionContent: string): QnAFile {
  const { resource } = qnaFile;
  const targetSection = resource.Sections.find((item) => item.sectionId === sectionId);
  if (!targetSection) {
    throw new Error(`update section: ${sectionId} not exist`);
  }
  const result = new sectionOperator(resource).updateSection(targetSection.Id, sectionContent);
  return convertQnAParseResultToQnAFile(qnaFile.id, result);
}

export function removeSection(qnaFile: QnAFile, sectionId: string): QnAFile {
  const { resource } = qnaFile;
  const targetSection = resource.Sections.find((item) => item.sectionId === sectionId);
  if (targetSection) {
    const result = new sectionOperator(resource).deleteSection(targetSection.Id);
    return convertQnAParseResultToQnAFile(qnaFile.id, result);
  } else {
    return qnaFile;
  }
}

/**
 * insert before position (Id)
 * for importSections, Id is string/path
 * for qnaSections, Id is number start from 0
 * @param qnaFile
 * @param position
 * @param sectionContent
 */
export function insertSection(qnaFile: QnAFile, position: number | string, sectionContent: string): QnAFile {
  if (position < 0) return qnaFile;
  const { resource } = qnaFile;

  const result = new sectionOperator(resource).insertSection(position, sectionContent);
  return convertQnAParseResultToQnAFile(qnaFile.id, result);
}

/**
 * if id is undefined, do add question
 * if content is undefined, do remove question
 * if id & content, do update question
 */
type QuestionChanges = {
  id?: string;
  content?: string;
};

type QnASectionChanges = {
  Questions?: QuestionChanges[];
  Answer?: string;
};

/**
 *
 * @param qnaFile
 * @param sectionId
 * @param changes
 * {
 *   Answer: Answer to update.
 *   Questions: {
 *      id: Question id for update, required
 *      content: Question content to update, if null do remove current question.
 *   }[]
 * }
 */
export function updateQnASection(qnaFile: QnAFile, sectionId: string, changes: QnASectionChanges): QnAFile {
  const { qnaSections } = qnaFile;

  const orginSection = qnaSections.find((item) => item.sectionId === sectionId);

  if (!orginSection) {
    throw new Error(`update section: ${sectionId} not exist`);
  }

  // remove qna pair.
  if (isEmpty(changes)) {
    return removeSection(qnaFile, sectionId);
  }

  let updatedQuestions = orginSection.Questions;
  let updatedAnswer = orginSection.Answer;
  if (changes.Questions && changes.Questions.length) {
    const questionsToRemove = changes.Questions.filter(({ id, content }) => id && !content);
    const questionsToAdd = changes.Questions.filter(({ id, content }) => !id && content) as {
      id: string;
      content: string;
    }[];
    const questionsToUpdate = changes.Questions.filter(({ id, content }) => id && content) as {
      id: string;
      content: string;
    }[];

    updatedQuestions = orginSection.Questions.filter((item) => !questionsToRemove.find(({ id }) => id === item.id)) // do remove
      .map((item) => {
        // do update
        const itemInChanges = questionsToUpdate.find((q) => q.id === item.id);
        if (itemInChanges) {
          return {
            id: item.id,
            content: itemInChanges.content,
          };
        }
        return item;
      })
      .concat(questionsToAdd); // do add
  }
  if (changes.Answer) {
    updatedAnswer = changes.Answer;
  }

  const sectionToUpdate = {
    ...orginSection,
    Questions: updatedQuestions,
    Answer: updatedAnswer,
  };

  const targetSectionContent = rebuildQnaSection(sectionToUpdate);

  return updateSection(qnaFile, sectionId, targetSectionContent);
}

export function createQnAQuestion(qnaFile: QnAFile, sectionId: string, questionContent: string) {
  const changes: QnASectionChanges = {
    Questions: [
      {
        content: questionContent,
      },
    ],
  };
  return updateQnASection(qnaFile, sectionId, changes);
}

export function removeQnAQuestion(qnaFile: QnAFile, sectionId: string, questionId: string) {
  const changes: QnASectionChanges = {
    Questions: [
      {
        id: questionId,
      },
    ],
  };
  return updateQnASection(qnaFile, sectionId, changes);
}

export function updateQnAQuestion(qnaFile: QnAFile, sectionId: string, questionId: string, questionContent: string) {
  const changes: QnASectionChanges = {
    Questions: [
      {
        id: questionId,
        content: questionContent,
      },
    ],
  };
  return updateQnASection(qnaFile, sectionId, changes);
}

export function updateQnAAnswer(qnaFile: QnAFile, sectionId: string, answerContent: string) {
  const changes: QnASectionChanges = {
    Answer: answerContent,
  };
  return updateQnASection(qnaFile, sectionId, changes);
}

export function addImport(qnaFile: QnAFile, path: string) {
  const importContent = `[import](${path})`;
  const firstImportSection = qnaFile.resource.Sections.find(
    ({ SectionType }) => SectionType === SectionTypes.ImportSection
  );
  const position = firstImportSection ? firstImportSection.Id : 0;
  return insertSection(qnaFile, position, importContent);
}

export function removeImport(qnaFile: QnAFile, id: string) {
  const targetImport =
    qnaFile.imports.find((item) => item.id === id) || qnaFile.imports.find((item) => item.id === `${id}.qna`);
  if (!targetImport) return qnaFile;
  const targetImportSection = qnaFile.resource.Sections.filter(
    ({ SectionType }) => SectionType === SectionTypes.ImportSection
  ).find(({ Path }) => Path === targetImport.path);
  if (!targetImportSection) return qnaFile;

  return removeSection(qnaFile, targetImportSection.sectionId);
}

export function parse(id: string, content: string): QnAFile {
  const result = luParser.parse(content);
  return convertQnAParseResultToQnAFile(id, result);
}
