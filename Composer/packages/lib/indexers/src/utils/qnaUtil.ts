// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * qnaUtil.ts is a single place handle lu file operation.
 * it's designed have no state, input text file, output text file.
 */

//import isEmpty from 'lodash/isEmpty';
import { QnASection } from '@bfc/shared';
import { sectionHandler } from '@microsoft/bf-lu/lib/parser/composerindex';
import cloneDeep from 'lodash/cloneDeep';

import { qnaIndexer } from '../qnaIndexer';

const { luParser, sectionOperator } = sectionHandler;

export function checkIsSingleSection(content: string) {
  const { Sections } = luParser.parse(content);
  return Sections.length === 1;
}

export function generateQnAPair() {
  let result = '';
  result += `# ? newQuestion\n`;
  result += '\n```';
  result += `\n- newAnswer`;
  result += '\n```';
  return result;
}

export function addSection(content: string, newContent: string) {
  const resource = luParser.parse(content);
  const res = new sectionOperator(resource).addSection(newContent);
  return res.Content;
}

export function updateSection(indexId: number, content: string, newContent: string) {
  if (indexId < 0) return content;
  const resource = luParser.parse(content);
  const { Sections } = resource;
  const sectionId = Sections[indexId].Id;
  const res = new sectionOperator(resource).updateSection(sectionId, newContent);
  return res.Content;
}

export function removeSection(indexId: number, content: string) {
  if (indexId < 0) return content;
  const resource = luParser.parse(content);
  const res = new sectionOperator(resource).deleteSection(indexId);
  return res.Content;
}

export function insertSection(indexId: number, content: string, newContent: string) {
  if (indexId < 0) return content;
  const resource = luParser.parse(content);
  return new sectionOperator(resource).insertSection(indexId, newContent).Content;
}

export function getParsedDiagnostics(newContent: string) {
  const { diagnostics } = qnaIndexer.parse(newContent);
  return diagnostics;
}

export function addQuestion(newContent: string, qnaSections: QnASection[], qnaSectionIndex: number) {
  const qnaFileContent = qnaSections.reduce((result, qnaSection, index) => {
    if (index != qnaSectionIndex) {
      result = result + '\n' + qnaSection.Body;
    } else {
      const newQnASection = addQuestionInQnASection(qnaSection, newContent);
      result += rebuildQnaSection(newQnASection);
    }
    return result;
  }, '');
  return qnaFileContent;
}

export function updateQuestion(
  newContent: string,
  questionIndex: number,
  qnaSections: QnASection[],
  qnaSectionIndex: number
) {
  const qnaFileContent = qnaSections.reduce((result, qnaSection, index) => {
    if (index !== qnaSectionIndex) {
      result = result + '\n' + qnaSection.Body;
    } else {
      const newQnASection = updateQuestionInQnASection(qnaSection, newContent, questionIndex);
      result += rebuildQnaSection(newQnASection);
    }
    return result;
  }, '');
  return qnaFileContent;
}

export function updateAnswer(newContent: string, qnaSections: QnASection[], qnaSectionIndex: number) {
  const qnaFileContent = qnaSections.reduce((result, qnaSection, index) => {
    if (index !== qnaSectionIndex) {
      result = result + '\n' + qnaSection.Body;
    } else {
      const newQnASection = updateAnswerInQnASection(qnaSection, newContent);
      result += rebuildQnaSection(newQnASection);
    }
    return result;
  }, '');
  return qnaFileContent;
}

function updateAnswerInQnASection(qnaSection: QnASection, answer: string) {
  const newQnASection: QnASection = cloneDeep(qnaSection);
  newQnASection.Answer = answer;
  return newQnASection;
}

function updateQuestionInQnASection(qnaSection: QnASection, question: string, questionIndex: number) {
  const newQnASection: QnASection = cloneDeep(qnaSection);
  if (question) {
    newQnASection.Questions[questionIndex] = question;
  } else {
    newQnASection.Questions.splice(questionIndex, 1);
  }
  return newQnASection;
}

function addQuestionInQnASection(qnaSection: QnASection, question: string) {
  const newQnASection: QnASection = cloneDeep(qnaSection);
  newQnASection.Questions.push(question);
  return newQnASection;
}

function rebuildQnaSection(qnaSection) {
  const { source, QAPairId, Questions, FilterPairs, Answer, promptsText } = qnaSection;
  let result = '';
  if (source && source != 'custom editorial') {
    result += `\n> !# @qna.pair.source = ${source}`;
  }
  if (QAPairId) {
    result += `\n<a id = "${QAPairId}"></a>`;
  }
  if (Questions && Questions.length !== 0) {
    result += `\n# ? ${Questions[0]}`;
    Questions.slice(1).forEach((question) => {
      result += `\n- ${question}`;
    });
  }
  if (FilterPairs && FilterPairs.length !== 0) {
    result += `\n**Filters:**`;
    FilterPairs.forEach((filterPair) => {
      result += `\n-${filterPair.key}=${filterPair.value}`;
    });
  }
  if (Answer !== undefined) {
    result += '\n```';
    result += `\n${Answer}`;
    result += '\n```';
  }
  if (promptsText) {
    result += '\n**Prompts:**';
    promptsText.forEach((prompt) => {
      result += `\n-${prompt}`;
    });
  }
  return result;
}
