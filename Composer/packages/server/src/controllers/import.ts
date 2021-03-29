// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { join } from 'path';

import { Request, Response } from 'express';
import { ensureDirSync } from 'fs-extra';
import extractZip from 'extract-zip';
import { ExternalContentProviderType } from '@botframework-composer/types';

import { contentProviderFactory } from '../externalContentProvider/contentProviderFactory';
import logger from '../logger';

const log = logger.extend('import-controller');

type ImportRequest = Request & {
  params: {
    source: ExternalContentProviderType;
  };
  query: {
    payload: string;
  };
};

/** Route exists so that the front end knows when the import flow is authenticated and can start displaying import status. */
async function authenticate(req: ImportRequest, res: Response) {
  const { source } = req.params;
  const { payload } = req.query;
  const metadata = JSON.parse(payload);

  const contentProvider = contentProviderFactory.getProvider({ kind: source, metadata });
  if (contentProvider) {
    if (contentProvider.authenticate) {
      const accessToken = await contentProvider.authenticate();
      return res.status(200).json({ accessToken });
    }
    // no-op
    res.sendStatus(200);
  } else {
    res.status(400).json({ message: 'No content provider found for source: ' + source });
  }
}

async function startImport(req: ImportRequest, res: Response) {
  const { source } = req.params;
  const { payload } = req.query;
  const metadata = JSON.parse(payload);

  const contentProvider = contentProviderFactory.getProvider({ kind: source, metadata });
  if (contentProvider) {
    try {
      // download the bot content zip
      const { eTag, urlSuffix, zipPath } = await contentProvider.downloadBotContent();

      // extract zip into new "template" directory
      const baseDir = process.env.COMPOSER_TEMP_DIR as string;
      const templateDir = join(baseDir, 'extractedTemplate-' + Date.now());
      ensureDirSync(templateDir);
      log('Extracting bot zip...');
      await extractZip(zipPath, { dir: templateDir });
      log('Done extracting.');
      await contentProvider.cleanUp();

      let alias;
      if (contentProvider.getAlias) {
        alias = await contentProvider.getAlias();
      }

      res.status(200).json({ alias, eTag, templateDir, urlSuffix });
    } catch (e) {
      const msg = 'Error importing bot content: ' + e;
      const err = new Error(msg);
      log(err);
      res.status(500).json({ message: err.stack });
    }
  } else {
    res.status(400).json({ message: 'No content provider found for source: ' + source });
  }
}

async function generateProfile(req: ImportRequest, res: Response) {
  const { source } = req.params;
  const payload = req.body;

  const contentProvider = contentProviderFactory.getProvider({ kind: source, metadata: payload });
  if (contentProvider?.generateProfile) {
    try {
      const profile = await contentProvider.generateProfile();
      res.status(200).json(profile);
    } catch (err) {
      res.status(500).json({ message: err.stack });
    }
  } else {
    res.status(400).json({ message: 'No content provider found for source: ' + source });
  }
}

async function getAlias(req: ImportRequest, res: Response) {
  const { source } = req.params;
  const payload = req.body;

  const contentProvider = contentProviderFactory.getProvider({ kind: source, metadata: payload });
  if (contentProvider?.getAlias) {
    try {
      const alias = await contentProvider.getAlias();
      res.status(200).json({ alias });
    } catch (error) {
      res.status(500).json({ message: error.stack });
    }
  } else {
    res.status(400).json({ message: 'No content provider found for source: ' + source });
  }
}

export const ImportController = {
  authenticate,
  startImport,
  generateProfile,
  getAlias,
};
