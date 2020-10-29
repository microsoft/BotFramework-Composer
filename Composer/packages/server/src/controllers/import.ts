import { Request, Response } from 'express';
import { join } from 'path';
import { ensureDirSync } from 'fs-extra';
import extractZip from 'extract-zip';
import { contentProviderFactory } from '../externalContentProvider/contentProviderFactory';
import { ExternalContentProviderType } from '../externalContentProvider/providerType';
import logger from '../logger';

const log = logger.extend('import-controller');

interface StartImportRequest extends Request {
  params: {
    source: ExternalContentProviderType;
  };
  query: {
    payload: string;
  };
}

async function startImport(req: StartImportRequest, res: Response, next) {
  const { source } = req.params;
  const { payload } = req.query;
  const metadata = JSON.parse(payload);

  const contentProvider = contentProviderFactory.getProvider({ type: source, metadata });
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

      setTimeout(() => {
        res.json({ alias, eTag, templateDir, urlSuffix });
      }, 2000);
    } catch (e) {
      const msg = 'Error importing bot content: ' + e;
      const err = new Error(msg);
      log(err);
      res.status(500).send(err.stack);
    }
  } else {
    res.status(500).send('No content provider found for source: ' + source);
  }
}

export const ImportController = {
  startImport,
};
