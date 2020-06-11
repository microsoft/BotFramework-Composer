// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * luUtil.ts is a single place handle lu file operation.
 * it's designed have no state, input text file, output text file.
 */

import isEmpty from 'lodash/isEmpty';
import { QnaSection } from '@bfc/shared';

const NEWLINE = '\r\n';

export function contentParse(content: string): QnaSection[] {
  const intentTexts = content.split('# ?').filter((intentText) => intentText.trim() !== '');
  const intentSections: QnaSection[] = [];
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

function generateContent(intentSections: QnaSection[]): string {
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
export function updateIntent(content: string, intentName: string, intent: QnaSection | null): string {
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
export function addIntent(content: string, { Question, Answer }: QnaSection): string {
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
