// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';
import { BotTemplateV2 } from '@bfc/shared';

import AssetService from '../services/asset';
import { getNpmTemplates } from '../utility/npm';

async function getProjTemplates(req: Request, res: Response) {
  try {
    const templates = await AssetService.manager.getProjectTemplates();
    res.status(200).json(templates);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : error,
    });
  }
}

export async function getProjTemplatesV2(req: any, res: any) {
  try {
    let templates: BotTemplateV2[] = [];

    // Get FeedUrl
    const { feedUrls, getFirstPartyNpm } = req.body;

    // Grab templates from FeedURls
    if (feedUrls) {
      const feedTemplates = await AssetService.manager.getCustomFeedTemplates(feedUrls);
      templates = templates.concat(feedTemplates);
    }

    if (getFirstPartyNpm) {
      // Grab templates from public npm
      templates = templates.concat(await getNpmTemplates());
    }

    // return templates
    res.status(200).json(templates);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : error,
    });
  }
}

export async function getTemplateReadMe(req: any, res: any) {
  try {
    const moduleName = req.query?.moduleName;

    if (!moduleName) {
      res.status(400).json({
        message: 'missing module name on request',
      });
    } else {
      const moduleURL = `https://registry.npmjs.org/${moduleName}`;
      const response = await fetch(moduleURL);
      const data = await response.json();
      res.status(200).json(data?.readme || '');
    }
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : error,
    });
  }
}

export const AssetController = {
  getProjTemplates: getProjTemplates,
  getProjTemplatesV2: getProjTemplatesV2,
  getTemplateReadMe: getTemplateReadMe,
};
