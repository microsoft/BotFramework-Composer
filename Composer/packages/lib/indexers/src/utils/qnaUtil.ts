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
      result = result + '\n' + qnaSection.Body + '\n';
    } else {
      const newQnASection = updateQuestionInQnASection(qnaSection, newContent, questionIndex);
      result += rebuildQnaSection(newQnASection);
    }
    return result;
  }, '');
  return qnaFileContent;
}

function updateQuestionInQnASection(qnaSection: QnASection, question: string, questionIndex: number) {
  const newQnASection: QnASection = cloneDeep(qnaSection);
  newQnASection.Questions[questionIndex] = question;
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
    result += `> !# @qna.pair.source = ${source}\n`;
  }
  if (QAPairId) {
    result += `<a id = "${QAPairId}"></a>\n`;
  }
  if (Questions && Questions.length !== 0) {
    result += `# ? ${Questions[0]}\n`;
    Questions.slice(1).forEach((question) => {
      result += `- ${question}\n`;
    });
  }
  if (FilterPairs && FilterPairs.length !== 0) {
    result += `**Filters:**\n`;
    FilterPairs.forEach((filterPair) => {
      result += `-${filterPair.key}=${filterPair.value}\n`;
    });
  }
  if (Answer) {
    result += '```\n';
    result += `${Answer}\n`;
    result += '```\n';
  }
  if (promptsText) {
    result += '**Prompts:**\n';
    promptsText.forEach((prompt) => {
      result += `-${prompt}\n`;
    });
  }
  return result;
}
