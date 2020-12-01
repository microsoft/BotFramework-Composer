// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotTemplateV2 } from '@bfc/shared';

import AssetService from '../services/asset';
import { getNpmTemplates } from '../utility/npm';
import { getNugetTemplates } from '../utility/nuget';

async function getProjTemplates(req: any, res: any) {
  try {
    const templates = await AssetService.manager.getProjectTemplates();
    res.status(200).json(templates);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : error,
    });
  }
}

async function getProjTemplatesV2(req: any, res: any) {
  try {
    const templates: BotTemplateV2[] = [];
    console.log(templates);
    // Get FeedUrl
    const { feedUrls } = req.body;

    // Grab templates from FeedURls
    if (feedUrls) {
      // TODO: implement grabbing of templates from custom feed URLs
    }

    // Grab templates from public npm
    const firstPartyNpmTemplates = await getNpmTemplates();
    // Grab templates from public NuGet
    const firstPartNugetTemplates = await getNugetTemplates();
    // Convert templates to BotTemplate type

    // return templates
    res.status(200).json(firstPartyNpmTemplates.concat(firstPartNugetTemplates));
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : error,
    });
  }
}

export const AssetController = {
  getProjTemplates: getProjTemplates,
  getProjTemplatesV2: getProjTemplatesV2,
};
