// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { parser } from '@microsoft/bf-lu/lib/parser';
const { parseFile } = parser;

async function extractLUISContent(text: string): Promise<any> {
  let parsedContent: any;
  const log = false;
  const locale = 'en-us';
  try {
    parsedContent = await parseFile(text, log, locale);
  } catch (e) {
    // nothing to do in catch block
  }

  if (parsedContent !== undefined) {
    return Promise.resolve(parsedContent.LUISJsonStructure);
  } else {
    return undefined;
  }
}

function getSuggestionEntities(luisJson: any, suggestionEntityTypes: string[]): string[] {
  const suggestionEntityList: string[] = [];
  if (luisJson !== undefined) {
    suggestionEntityTypes.forEach((entityType) => {
      if (luisJson[entityType] !== undefined && luisJson[entityType].length > 0) {
        luisJson[entityType].forEach((entity) => {
          if (entity?.name) {
            suggestionEntityList.push(entity.name);
          }
        });
      }
    });
  }

  return suggestionEntityList;
}

const suggestionAllEntityTypes = [
  'entities',
  'regex_entities',
  'patternAnyEntities',
  'preBuiltEntities',
  'closedLists',
  'phraseLists',
  'composites',
];

async function ExtractAllEntities(text: string): Promise<string[]> {
  const luisJson = await extractLUISContent(text);
  const entities = getSuggestionEntities(luisJson, suggestionAllEntityTypes);
  return entities;
}

export default ExtractAllEntities;
