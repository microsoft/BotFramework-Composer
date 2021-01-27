// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';
import { BotTemplateV2 } from '@bfc/shared';
import cheerio from 'cheerio';

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
      // TODO: Current assumption is that the feed is an npm feed with given result structure (https://registry.npmjs.org/-/v1/search?text=docker&size=100&from=0&quality=0.65&popularity=0.98&maintenance=0.5)
      const feedTemplates = await await AssetService.manager.getCustomFeedTemplates(feedUrls);
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
    const { moduleName } = req.body;

    //OPTION 1
    const moduleURL = 'http://npmjs.org/' + moduleName;
    const response = await fetch(moduleURL);
    const html = await response.text();
    const $ = cheerio.load(html); // Load the HTML string into cheerio
    const readMeDiv = $('#readme').html(); // Parse the HTML and extract just whatever code contains .statsTableContainer and has tr inside
    res.status(200).json(readMeDiv);
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
