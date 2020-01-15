// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * luUtil.ts is a single place use lu-parser handle lu file operation.
 * it's designed have no state, input text file, output text file.
 * for more usage detail, please check client/__tests__/utils/luUtil.test.ts
 */

import { sectionHandler } from '@bfcomposer/bf-lu/lib/parser';
import { LuFile, DialogInfo } from '@bfc/indexers';
import isEmpty from 'lodash/isEmpty';

const { luParser, sectionOperator } = sectionHandler;

export interface LuIntent {
  Name: string;
  Body: string;
}

const NEWLINE = '\n';

export function textFromIntent(intent: LuIntent | null, secondary = false): string {
  if (!intent || isEmpty(intent)) return '';
  const { Name, Body } = intent;
  const textBuilder: string[] = [];
  if (Name && Body) {
    if (secondary) {
      textBuilder.push(`## ${Name.trim()}`);
    } else {
      textBuilder.push(`# ${Name.trim()}`);
    }
    textBuilder.push(Body);
  }
  return textBuilder.join(NEWLINE);
}

export function textFromIntents(intents: LuIntent[], secondary = false): string {
  return intents.map(intent => textFromIntent(intent, secondary)).join(`${NEWLINE}${NEWLINE}`);
}

function updateInSections(sections: LuIntent[], intentName: string, updatedIntent: LuIntent | null): LuIntent[] {
  // remove
  if (!updatedIntent || isEmpty(updatedIntent)) {
    return sections.filter(({ Name }) => Name !== intentName);
  }
  // add
  if (sections.findIndex(({ Name }) => Name === intentName) === -1) {
    sections.push(updatedIntent);
    return sections;
  }
  // update
  return sections.map(section => {
    if (section.Name === intentName) {
      return updatedIntent;
    }
    return section;
  });
}

/**
 *
 * @param content origin lu file content
 * @param intentName intent Name, support subSection naming 'CheckEmail/CheckUnreadEmail'. if #CheckEmail not exist will do recursive add.
 * @param {Name, Body} intent the updates. if intent is empty will do remove.
 */
export function updateIntent(content: string, intentName: string, intent: LuIntent | null): string {
  let targetSection;
  let targetSectionContent;
  const updatedSectionContent = textFromIntent(intent);
  const resource = luParser.parse(content);
  const { Sections } = resource;

  // if intent is null, do remove
  // if remove target not exist return origin content;
  if (!intent || isEmpty(intent)) {
    if (intentName.includes('/')) {
      const [parrentName, childName] = intentName.split('/');
      const targetChildSection = Sections.find(({ Name }) => Name === parrentName)?.SimpleIntentSections.find(
        ({ Name }) => Name === childName
      );
      if (!targetChildSection) {
        return content;
      }
    } else {
      const targetSection = Sections.find(({ Name }) => Name === intentName);
      if (targetSection) {
        return new sectionOperator(resource).deleteSection(targetSection.Id).Content;
      }
      return content;
    }
  }

  // nestedSection name path
  if (intentName.includes('/')) {
    const [parrentName, childName] = intentName.split('/');
    targetSection = Sections.find(({ Name }) => Name === parrentName);

    if (targetSection) {
      const updatedSections = updateInSections(targetSection.SimpleIntentSections, childName, intent);
      targetSectionContent = textFromIntent({ Name: targetSection.Name, Body: textFromIntents(updatedSections, true) });
    } else {
      targetSectionContent = textFromIntent({ Name: parrentName, Body: textFromIntent(intent, true) });
    }
  } else {
    targetSection = Sections.find(({ Name }) => Name === intentName);
    targetSectionContent = updatedSectionContent;
  }

  // update
  if (targetSection) {
    return new sectionOperator(resource).updateSection(targetSection.Id, targetSectionContent).Content;
    // add if not exist
  } else {
    return new sectionOperator(resource).addSection(['', targetSectionContent].join(NEWLINE)).Content;
  }
}

/**
 *
 * @param content origin lu file content
 * @param {Name, Body} intent the adds. Name support subSection naming 'CheckEmail/CheckUnreadEmail', if #CheckEmail not exist will do recursive add.
 */
export function addIntent(content: string, { Name, Body }: LuIntent): string {
  const intentName = Name;
  if (Name.includes('/')) {
    const [, childName] = Name.split('/');
    Name = childName;
  }
  return updateIntent(content, intentName, { Name, Body });
}

/**
 *
 * @param content origin lu file content
 * @param intentName the remove intentName. Name support subSection naming 'CheckEmail/CheckUnreadEmail', if any of them not exist will do nothing.
 */
export function removeIntent(content: string, intentName: string): string {
  if (intentName.includes('/')) {
    return updateIntent(content, intentName, null);
  }
  const resource = luParser.parse(content);
  const { Sections } = resource;
  const targetSection = Sections.find(({ Name }) => Name === intentName);
  if (targetSection) {
    return new sectionOperator(resource).deleteSection(targetSection.Id).Content;
  }
  return content;
}

export function getReferredFiles(luFiles: LuFile[], dialogs: DialogInfo[]) {
  return luFiles.filter(file => {
    if (dialogs.findIndex(dialog => dialog.luFile === file.id) !== -1) {
      return true;
    }
    return false;
  });
}
