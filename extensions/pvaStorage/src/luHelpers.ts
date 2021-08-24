// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { readFile } from 'fs-extra';
import bfLU from '@microsoft/bf-lu';

export const parseIntentsFromLuFile = async (path) => {
  const luContent = await readFile(path, { encoding: 'utf-8' }); // eslint-disable-line
  const parsedLuContent = await bfLU.V2.LuisBuilder.fromContentAsync(luContent);

  const intentMap: Record<string, string[]> = {};
  for (const intent of parsedLuContent.intents) {
    const intentName = intent.name;
    const intentUtterances = [];

    for (const utterance of parsedLuContent.utterances) {
      if (utterance.intent === intentName) {
        intentUtterances.push(utterance.text);
      }
    }
    intentMap[intentName] = intentUtterances;
  }
  return intentMap;
};

export const getLuFileContentForIntent = async (path: string, intentName: string, utterances: string[]) => {
  let luContent = `# ${intentName}`;
  for (const utterance of utterances) {
    luContent += `\n- ${utterance}`;
  }
  return luContent;
};
