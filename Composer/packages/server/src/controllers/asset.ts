// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotTemplate, emptyBotNpmTemplateName, localTemplateId, QnABotTemplateId } from '@bfc/shared';
import formatMessage from 'format-message';

import fetch from '../utility/fetch';
import AssetService from '../services/asset';
import log from '../logger';
import { sortTemplates } from '../utility/creation';
import { FeatureFlagService } from '../services/featureFlags';
import { Store } from '../store/store';

export async function getProjTemplates(req: any, res: any) {
  try {
    let templates: BotTemplate[] = [];
    const advancedTemplateOptionsEnabled = FeatureFlagService.getFeatureFlagValue('ADVANCED_TEMPLATE_OPTIONS');

    // Get FeedUrl
    const { feedUrls } = req.body;

    // Grab templates from FeedURls
    if (feedUrls) {
      const feedTemplates = await AssetService.manager.getCustomFeedTemplates(feedUrls);

      // Add qna template manually with empty bot template version as qna uses empty bot under the hood
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

      // Add local template option for advanced users
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

export async function fetchTemplateFeedUrl(req: any, res: any) {
  const templateFeedUrl = Store.get('customTemplateFeedUrl', '');
  res.status(200).json({ templateFeedUrl: templateFeedUrl });
}

export async function setTemplateFeedUrl(req: any, res: any) {
  Store.set('customTemplateFeedUrl', req.body?.feedUrl);
  res.status(200).json({ templateFeedUrl: req.body?.feedUrl });
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
      // check for readme at root of response obj
      let readMe = data?.readme;

      // if no readme at root then pull readme from latest published version that has one
      if (!readMe) {
        const versionsDict = data?.versions;
        const versionTimesObj = data?.time;
        if (versionsDict && versionTimesObj) {
          // convert versionPublishTimes obj to a 2d array
          // each entry is an array with two fields, version number and dateTime published
          const items = Object.entries(versionTimesObj);

          // sort versionPublishTimes entries based on time published
          items.sort((firstEntry, secondEntry) => {
            const firstEntryDate = new Date(firstEntry[1] as string).getTime();
            const secondEntryDate = new Date(secondEntry[1] as string).getTime();
            return firstEntryDate > secondEntryDate ? 1 : -1;
          });

          // iterate, starting on most recently published version, and query versionDict for a readMe for the version in question
          for (let i = items.length - 1; i > -1; i--) {
            if (versionsDict[items[i][0]] && versionsDict[items[i][0]]?.readme) {
              // if a readMe exists, set it as our result and break out of the loop
              readMe = versionsDict[items[i][0]]?.readme;
              break;
            }
          }
        }
      }

      res.status(200).json(readMe || formatMessage('Read Me cannot be found for this template'));
    }
  } catch (error) {
    log('Failed getting template readMe', error);

    res.status(200).json('## Issue hit getting template readMe');
  }
}

export const AssetController = {
  getProjTemplates: getProjTemplates,
  getTemplateReadMe: getTemplateReadMe,
  fetchTemplateFeedUrl: fetchTemplateFeedUrl,
  setTemplateFeedUrl: setTemplateFeedUrl,
};
