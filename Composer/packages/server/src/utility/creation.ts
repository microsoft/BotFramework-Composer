// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotTemplate, QnABotTemplateId } from '@bfc/shared';
import union from 'lodash/union';

export const templateSortOrder = [
  { generatorName: '@microsoft/generator-microsoft-bot-empty', displayName: 'Blank bot' },
  { generatorName: '@microsoft/generator-microsoft-bot-conversational-core', displayName: 'Basic conversational bot' },
  { generatorName: QnABotTemplateId, displayName: 'QnAMaker bot' },
];

export const sortTemplates = (templates: BotTemplate[]): BotTemplate[] => {
  let sortedTemplateList: BotTemplate[] = [];

  // Sort incoming template array and reassign display name based on sort list
  templateSortOrder.forEach((tempSortEntry, index) => {
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
