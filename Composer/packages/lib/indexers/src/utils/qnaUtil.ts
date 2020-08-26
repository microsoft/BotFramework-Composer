// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * qnaUtil.ts is a single place handle qna file operation.
 * it's designed have no state, input text file, output text file.
 */

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
  return '\n# ?\n```\n\n```';
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
    if (index !== qnaSectionIndex) {
      result = result + (index === 0 ? qnaSection.Body : '\n' + qnaSection.Body);
    } else {
      const newQnASection = addQuestionInQnASection(qnaSection, newContent);
      result += rebuildQnaSection(newQnASection, index === 0);
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
      result = result + (index === 0 ? qnaSection.Body : '\n' + qnaSection.Body);
    } else {
      const newQnASection = updateQuestionInQnASection(qnaSection, newContent, questionIndex);
      result += rebuildQnaSection(newQnASection, index === 0);
    }
    return result;
  }, '');
  return qnaFileContent;
}

export function updateAnswer(newContent: string, qnaSections: QnASection[], qnaSectionIndex: number) {
  const qnaFileContent = qnaSections.reduce((result, qnaSection, index) => {
    if (index !== qnaSectionIndex) {
      result = result + (index === 0 ? qnaSection.Body : '\n' + qnaSection.Body);
    } else {
      const newQnASection = updateAnswerInQnASection(qnaSection, newContent);
      result += rebuildQnaSection(newQnASection, index === 0);
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
    newQnASection.Questions[questionIndex].content = question;
  } else {
    newQnASection.Questions.splice(questionIndex, 1);
  }
  return newQnASection;
}

//will replace an empty question or add a new question
function addQuestionInQnASection(qnaSection: QnASection, question: string) {
  const newQnASection: QnASection = cloneDeep(qnaSection);
  const emptyQuestionIndex = newQnASection.Questions.findIndex((q) => q.content === '');
  if (emptyQuestionIndex > -1) {
    newQnASection.Questions[emptyQuestionIndex].content = question;
    return newQnASection;
  }
  newQnASection.Questions.push({ content: question, id: '' });
  return newQnASection;
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
