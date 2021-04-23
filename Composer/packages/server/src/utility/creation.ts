// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotTemplate, QnABotTemplateId } from '@bfc/shared';
import union from 'lodash/union';

import logger from '../logger';
import AssetService from '../services/asset';

export const defaultSortOrder = [
  { generatorName: '@microsoft/generator-bot-empty', displayName: 'Blank bot' },
  { generatorName: '@microsoft/generator-bot-conversational-core', displayName: 'Basic bot' },
  { generatorName: '@microsoft/generator-bot-assistant-core', displayName: 'Basic assistant' },
  { generatorName: '@microsoft/generator-bot-enterprise-assistant', displayName: 'Enterprise assistant' },
  { generatorName: '@microsoft/generator-bot-people', displayName: 'People' },
  { generatorName: '@microsoft/generator-bot-calendar', displayName: 'Calendar' },
  { generatorName: '@microsoft/generator-bot-core-language', displayName: 'Core Bot with Language' },
  { generatorName: QnABotTemplateId, displayName: 'Core Bot with QnA Maker' },
  { generatorName: '@microsoft/generator-bot-core-assistant', displayName: 'Core Assistant Bot' },
  { generatorName: '@microsoft/generator-bot-enterprise-calendar', displayName: 'Enterprise Calendar Bot' },
  { generatorName: '@microsoft/generator-bot-enterprise-people', displayName: 'Enterprise People Bot' },
];

export const sortTemplates = async (templates: BotTemplate[]): Promise<BotTemplate[]> => {
  let sortedTemplateList: BotTemplate[] = [];
  let sortOrder = defaultSortOrder;
  try {
    const templateSortOrder = await AssetService.manager.getRawGithubFileContent(
      'microsoft',
      'BotFramework-Composer',
      'main',
      'templates.json'
    );
    const templateSortOrderObj = JSON.parse(templateSortOrder);
    sortOrder = templateSortOrderObj && templateSortOrderObj?.length > 0 ? templateSortOrderObj : defaultSortOrder;
  } catch (err) {
    logger(JSON.stringify(err, Object.getOwnPropertyNames(err)));
  }

  sortOrder.forEach((tempSortEntry) => {
    const templateIndex = templates.findIndex((template) => {
      return template.id === tempSortEntry.generatorName;
    });
    if (templateIndex != -1) {
      templates[templateIndex].name = tempSortEntry.displayName;
      sortedTemplateList.push(templates[templateIndex]);
    }
  });
  // append any templates not defined in sort list
  sortedTemplateList = union(sortedTemplateList, templates);
  return sortedTemplateList;
};
