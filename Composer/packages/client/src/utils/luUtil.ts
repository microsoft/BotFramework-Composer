// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { sectionHandler } from '@bfcomposer/bf-lu/lib/parser';
import { LuFile, DialogInfo } from '@bfc/indexers';

const { luParser, sectionOperator } = sectionHandler;

export interface LuIntent {
  name: string;
  body: string;
}

export function textFromIntent(intent: LuIntent): string {
  const { name, body } = intent;
  const textBuilder: string[] = [];
  if (name && body) {
    textBuilder.push(`# ${name.trim()}`);
    textBuilder.push(`\n${body.trim()}`);
  }
  return textBuilder.join('');
}

export function updateIntent(content: string, intentName: string, { name, body }: LuIntent): string {
  const newIntentCentent = textFromIntent({ name, body });
  const resource = luParser.parse(content);
  const { Sections } = resource;
  const section = Sections.find(({ Name }) => Name === intentName);
  if (section) {
    return new sectionOperator(resource).updateSection(section.Id, newIntentCentent).Content;
    // add if not exist
  } else {
    return new sectionOperator(resource).addSection(newIntentCentent).Content;
  }
}

export function addIntent(content: string, { name, body }: LuIntent): string {
  const newIntentCentent = textFromIntent({ name, body });
  const resource = luParser.parse(content);
  return new sectionOperator(resource).addSection(newIntentCentent).Content;
}

export function removeIntent(content: string, name: string): string {
  const resource = luParser.parse(content);
  const { Sections } = resource;
  const section = Sections.find(({ Name }) => Name === name);
  return new sectionOperator(resource).deleteSection(section.Id).Content;
}

export function getReferredFiles(luFiles: LuFile[], dialogs: DialogInfo[]) {
  return luFiles.filter(file => {
    if (dialogs.findIndex(dialog => dialog.luFile === file.id) !== -1) {
      return true;
    }
    return false;
  });
}
