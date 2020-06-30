// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * qnaUtil.ts is a single place handle lu file operation.
 * it's designed have no state, input text file, output text file.
 */

import isEmpty from 'lodash/isEmpty';
import { QnASection, DialogInfo, QnAFile } from '@bfc/shared';
import { sectionHandler } from '@microsoft/bf-lu/lib/parser/composerindex';

import { qnaIndexer } from '../qnaIndexer';

import { getBaseName } from './help';

const { luParser, sectionOperator } = sectionHandler;

const NEWLINE = '\r\n';

export function contentParse(content: string): QnASection[] {
  const intentTexts = content.split('# ?').filter((intentText) => intentText.trim() !== '');
  const intentSections: QnASection[] = [];
  intentTexts.forEach((text) => {
    const [question, answer] = text
      .trim()
      .substring(0, text.trim().length - 3)
      .split('```');
    intentSections.push({
      Question: `- ${question}`.trim(),
      Answer: answer.trim(),
    });
  });
  return intentSections;
}

function generateContent(intentSections: QnASection[]): string {
  const intentTexts: string[] = [];
  intentSections.forEach((section) => {
    const question = '# ? ' + section.Question.replace('-', '').trim();
    intentTexts.push(`${question} ${NEWLINE} ` + '```' + NEWLINE + section.Answer + NEWLINE + '```' + NEWLINE);
  });
  return intentTexts.join(NEWLINE);
}
/**
 *
 * @param content origin qna file content
 * @param intentName intent Name.
 * @param {Question, Answer} intent the updates. if intent is empty will do remove.
 */
export function updateIntent(content: string, intentName: string, intent: QnASection | null): string {
  let sections = contentParse(content);
  // if intent is null, do remove
  // and if remove target not exist return origin content;
  const targetSection = sections.find(
    ({ Question }) => Question.replace('-', '').trim() === intentName.replace('-', '').trim()
  );
  if (!intent || isEmpty(intent)) {
    if (targetSection) {
      sections = sections.filter((section) => section.Question !== targetSection.Question);
    }
  } else {
    // update
    if (targetSection) {
      sections.map((section) => {
        if (section.Question === targetSection.Question) {
          section.Question = intent.Question;
          section.Answer = intent.Answer;
        }
        return section;
      });
      // add if not exist
    } else {
      sections.push(intent);
    }
  }

  return generateContent(sections);
}

/**
 *
 * @param content origin qna file content
 * @param {Qunstion, Answer} intent the adds.
 */
export function addIntent(content: string, { Question, Answer }: QnASection): string {
  const intentName = Question;
  return updateIntent(content, intentName, { Question, Answer });
}

/**
 *
 * @param content origin qna file content
 * @param intentName the remove intentName.
 */
export function removeIntent(content: string, intentName: string): string {
  return updateIntent(content, intentName, null);
}

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

export function getReferredQnaFiles(qnaFiles: QnAFile[], dialogs: DialogInfo[]) {
  return qnaFiles.filter((file) => {
    const idWithOutLocale = getBaseName(file.id);
    return dialogs.some((dialog) => dialog.qnaFile === idWithOutLocale);
  });
}

export function checkQnaBuild(qnaFiles: QnAFile[], dialogs: DialogInfo[]) {
  const referred = getReferredQnaFiles(qnaFiles, dialogs);

  return referred;
}
