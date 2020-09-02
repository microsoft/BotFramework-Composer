// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * qnaUtil.ts is a single place handle lu file operation.
 * it's designed have no state, input text file, output text file.
 */

//import isEmpty from 'lodash/isEmpty';
import { QnAFile } from '@bfc/shared';
import { sectionHandler } from '@microsoft/bf-lu/lib/parser/composerindex';
import isEmpty from 'lodash/isEmpty';
import { Diagnostic, Position, Range, DiagnosticSeverity, LuParseResource } from '@bfc/shared';
import { nanoid } from 'nanoid';

const { luParser, sectionOperator } = sectionHandler;

enum SectionTypes {
  QnASection = 'qnaSection',
  ImportSection = 'importSection',
  LUModelInfo = 'modelInfoSection',
}

function rebuildQnaSection(qnaSection, isfirstQnA: boolean) {
  const { source, QAPairId, Questions, FilterPairs, Answer, promptsText } = qnaSection;
  let result = '';
  if (source && source !== 'custom editorial') {
    result += !result && isfirstQnA ? '' : '\n';
    result += `> !# @qna.pair.source = ${source}`;
  }
  if (QAPairId) {
    result += !result && isfirstQnA ? '' : '\n';
    result += `<a id = "${QAPairId}"></a>`;
  }
  result += !result && isfirstQnA ? '' : '\n';
  result += `# ?`;
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
    const range = new Range(
      new Position(section.Range.Start.Line, section.Range.Start.Character),
      new Position(section.Range.End.Line, section.Range.End.Character)
    );
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
      range,
    };
  });

  const imports = Sections.filter(({ SectionType }) => SectionType === SectionTypes.ImportSection).map(
    ({ Path }) => Path
  );

  const infos = Sections.filter(({ SectionType }) => SectionType === SectionTypes.LUModelInfo).map(
    ({ ModelInfo }) => ModelInfo
  );

  const headers = qnaSections.length ? Content.substring(0, Content.indexOf(qnaSections[0].Body)) : Content;

  const diagnostics = Errors.map((e) => convertQnADiagnostic(e, id));
  return {
    id,
    content: Content,
    empty: isEmpty(Sections),
    qnaSections,
    diagnostics,
    resource: { Sections, Errors, Content },
    headers,
    imports,
    infos,
  };
}

export function checkIsSingleSection(content: string) {
  const { Sections } = luParser.parse(content);
  return Sections.length === 1;
}

export function generateQnAPair() {
  let result = '';
  result += '\n# ?\n```\n\n```';
  return result;
}

export function addSection(qnaFile: QnAFile, sectionContent: string): QnAFile {
  const { resource } = qnaFile;

  const result = new sectionOperator(resource).addSection(sectionContent);
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
  const targetSectionIndex = resource.Sections.findIndex((item) => item.sectionId === sectionId);
  if (targetSectionIndex > -1) {
    const result = new sectionOperator(resource).deleteSection(targetSectionIndex);
    return convertQnAParseResultToQnAFile(qnaFile.id, result);
  } else {
    return qnaFile;
  }
}

export function insertSection(qnaFile: QnAFile, position: number, sectionContent: string): QnAFile {
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
interface QuestionChanges {
  id?: string;
  content?: string;
}

interface QnASectionChanges {
  Questions?: QuestionChanges[];
  Answer?: string;
}

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
  const { resource, qnaSections } = qnaFile;
  const { Sections } = resource;

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

  const isfirstQnA = Sections[0].sectionId === sectionId;
  const targetSectionContent = rebuildQnaSection(sectionToUpdate, isfirstQnA);

  return updateSection(qnaFile, sectionId, targetSectionContent);
}

export function addQnAQuestion(qnaFile: QnAFile, sectionId: string, questionContent: string) {
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

export function parse(id: string, content: string): QnAFile {
  const result = luParser.parse(content);
  return convertQnAParseResultToQnAFile(id, result);
}
