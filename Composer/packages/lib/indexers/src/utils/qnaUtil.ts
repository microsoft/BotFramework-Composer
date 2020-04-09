// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * luUtil.ts is a single place handle lu file operation.
 * it's designed have no state, input text file, output text file.
 */

import isEmpty from 'lodash/isEmpty';
import { QnaIntentSection } from '@bfc/shared';

const NEWLINE = '\r\n';

export function contentParse(content: string): QnaIntentSection[] {
  const intentTexts = content.split('#').filter(intentText => intentText.trim() !== '');
  const intentSections: QnaIntentSection[] = [];
  intentTexts.forEach(text => {
    const [name, body] = text
      .trim()
      .substring(0, text.trim().length - 3)
      .split('```');
    intentSections.push({
      Name: name.replace(NEWLINE, '').trim(),
      Body: body.trim(),
    });
  });
  return intentSections;
}

function generateContent(intentSections: QnaIntentSection[]): string {
  const intentTexts: string[] = [];
  intentSections.forEach(section => {
    intentTexts.push(`# ${section.Name} ${NEWLINE} ` + '```' + NEWLINE + section.Body + NEWLINE + '```' + NEWLINE);
  });
  return intentTexts.join(NEWLINE);
}
/**
 *
 * @param content origin qna file content
 * @param intentName intent Name.
 * @param {Name, Body} intent the updates. if intent is empty will do remove.
 */
export function updateIntent(content: string, intentName: string, intent: QnaIntentSection | null): string {
  let sections = contentParse(content);
  // if intent is null, do remove
  // and if remove target not exist return origin content;
  const targetSection = sections.find(({ Name }) => Name === intentName);
  if (!intent || isEmpty(intent)) {
    if (targetSection) {
      sections = sections.filter(section => section.Name !== targetSection.Name);
    }
  } else {
    // update
    if (targetSection) {
      sections.map(section => {
        if (section.Name === targetSection.Name) {
          section.Body = intent.Body;
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
 * @param {Name, Body} intent the adds.
 */
export function addIntent(content: string, { Name, Body }: QnaIntentSection): string {
  const intentName = Name;
  return updateIntent(content, intentName, { Name, Body });
}

/**
 *
 * @param content origin qna file content
 * @param intentName the remove intentName.
 */
export function removeIntent(content: string, intentName: string): string {
  return updateIntent(content, intentName, null);
}
