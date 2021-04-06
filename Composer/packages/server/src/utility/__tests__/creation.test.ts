// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotTemplate } from '@bfc/shared';

import { sortTemplates, templateSortOrder } from '../creation';

describe('templateSort', () => {
  const templates: BotTemplate[] = [
    {
      id: '@microsoft/generator-bot-assistant-core',
      name: ' Calendar Assistant',
      description: 'Preview Calendar Assistant template for TESTING ONLY',
      package: {
        packageName: '@microsoft/generator-microsoft-bot-calendar-assistant',
        packageSource: 'npm',
        packageVersion: '0.0.1-preview-20210302.2eaae0d',
      },
    },
    {
      id: '@microsoft/generator-bot-enterprise-assistant',
      name: ' Calendar Assistant',
      description: 'Preview Calendar Assistant template for TESTING ONLY',
      package: {
        packageName: '@microsoft/generator-microsoft-bot-calendar-assistant',
        packageSource: 'npm',
        packageVersion: '0.0.1-preview-20210302.2eaae0d',
      },
    },
    {
      id: '@microsoft/generator-bot-people',
      name: ' Calendar Assistant',
      description: 'Preview Calendar Assistant template for TESTING ONLY',
      package: {
        packageName: '@microsoft/generator-microsoft-bot-calendar-assistant',
        packageSource: 'npm',
        packageVersion: '0.0.1-preview-20210302.2eaae0d',
      },
    },
    {
      id: '@microsoft/generator-bot-calendar',
      name: ' Calendar',
      description: 'Preview calendar bot for TESTING ONLY',
      package: {
        packageName: '@microsoft/generator-microsoft-bot-calendar',
        packageSource: 'npm',
        packageVersion: '0.0.1-preview-20210301.79c8ef3',
      },
    },
    {
      id: '@microsoft/generator-bot-conversational-core',
      name: ' Conversational Core',
      description: 'Preview conversational core package for TESTING ONLY',
      package: {
        packageName: '@microsoft/generator-microsoft-bot-conversational-core',
        packageSource: 'npm',
        packageVersion: '1.0.0-preview-20210302.663d14c',
      },
    },
    {
      id: '@microsoft/generator-bot-empty',
      name: ' Empty',
      description:
        'Instantiates a Bot Framework bot using the [component model](https://aka.ms/ComponentTemplateDocumentation). This template instantiates an empty bot with no dependent packages.',
      package: {
        packageName: '@microsoft/generator-microsoft-bot-empty',
        packageSource: 'npm',
        packageVersion: '1.0.0-preview-20210302.663d14c',
      },
    },
    {
      id: 'QnASample',
      name: 'generator-qna-bot',
      description: 'Empty bot template that routes to qna configuration',
      package: {
        packageName: 'generator-empty-bot',
        packageSource: 'npm',
        packageVersion: '0.0.1',
      },
    },
  ];

  it('should return sorted templates per sortOrder obj', async () => {
    // note - the list in templates has to include all the same items in creation.ts
    const sortedTemplateList = sortTemplates(templates);
    templateSortOrder.forEach((templateSortEntry, index) => {
      if (
        templates.findIndex((temp) => {
          temp.id === templateSortEntry.generatorName;
        })
      ) {
        expect(templateSortEntry.generatorName).toEqual(sortedTemplateList[index].id);
      }
    });
  });
});
