// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotTemplate, emptyBotNpmTemplateName, localTemplateId, QnABotTemplateId } from '@bfc/shared';
import formatMessage from 'format-message';

import fetch from '../utility/fetch';
import AssetService from '../services/asset';
import { getNpmTemplates } from '../utility/npm';
import log from '../logger';
import { sortTemplates } from '../utility/creation';
import { FeatureFlagService } from '../services/featureFlags';

export async function getProjTemplates(req: any, res: any) {
  try {
    let templates: BotTemplate[] = [];
    const advancedTemplateOptionsEnabled = FeatureFlagService.getFeatureFlagValue('ADVANCED_TEMPLATE_OPTIONS');

    // Get FeedUrl
    const { feedUrls, getFirstPartyNpm } = req.body;

    // Grab templates from FeedURls
    if (feedUrls) {
      const feedTemplates = await AssetService.manager.getCustomFeedTemplates(feedUrls);
      const emptyBot = feedTemplates.filter((template) => {
        return template.id === emptyBotNpmTemplateName;
      });
      const qnaTemplateVersion =
        emptyBot.length > 0 && emptyBot[0].package?.packageVersion ? emptyBot[0].package.packageVersion : '*';
      templates = templates.concat(feedTemplates);
      templates.push({
        id: QnABotTemplateId,
        name: 'QNA',
        description: formatMessage('Empty bot template that routes to qna configuration'),
        dotnetSupport: {
          functionsSupported: true,
          webAppSupported: true,
        },
        nodeSupport: {
          functionsSupported: true,
          webAppSupported: true,
        },
        package: {
          packageName: emptyBotNpmTemplateName,
          packageSource: 'npm',
          packageVersion: qnaTemplateVersion,
          availableVersions: [],
        },
      });
      if (advancedTemplateOptionsEnabled) {
        templates.push({
          id: localTemplateId,
          name: 'Create from local template',
          description: formatMessage('Create a bot using a local yeoman generator'),
          dotnetSupport: {
            functionsSupported: true,
            webAppSupported: true,
          },
          nodeSupport: {
            functionsSupported: true,
            webAppSupported: true,
          },
          package: {
            packageName: '',
            packageSource: '',
            packageVersion: '',
            availableVersions: [],
          },
        });
      }
    }

    if (getFirstPartyNpm) {
      // Grab templates from public npm
      templates = templates.concat(await getNpmTemplates());
    }

    const sortedTemplateList = await sortTemplates(templates);

    // return templates
    res.status(200).json(sortedTemplateList);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : error,
    });
  }
}

export async function getLatestGeneratorVersion(moduleName: string): Promise<string> {
  try {
    const moduleURL = `https://registry.npmjs.org/${moduleName}`;
    const response = await fetch(moduleURL);
    const data = await response.json();
    return data['dist-tags'].latest || '*';
  } catch (err) {
    log('Could not retrieve latest generator version', err);
    return '*';
  }
}

export async function getTemplateReadMe(req: any, res: any) {
  try {
    const moduleName = req.query?.moduleName;

    if (!moduleName) {
      res.status(400).json({
        message: 'missing module name on request',
      });
    } else if (moduleName === QnABotTemplateId) {
      const qnaReadMe = await AssetService.manager.getRawGithubFileContent(
        'microsoft',
        'botframework-components',
        'main',
        'generators/generator-bot-core-qna/README.md'
      );
      res.status(200).json(qnaReadMe);
    } else {
      const moduleURL = `https://registry.npmjs.org/${moduleName}`;
      const response = await fetch(moduleURL);
      const data = await response.json();
      res.status(200).json(data?.readme || '');
    }
  } catch (error) {
    log('Failed getting template readMe', error);

    res.status(200).json('## Issue hit getting template readMe');
  }
}

export const AssetController = {
  getProjTemplates: getProjTemplates,
  getTemplateReadMe: getTemplateReadMe,
};
