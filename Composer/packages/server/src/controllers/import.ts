import { Request, Response } from 'express';
import { join } from 'path';
import { ensureDirSync } from 'fs-extra';
import extractZip from 'extract-zip';
import { contentProviderFactory } from '../externalContentProvider/contentProviderFactory';
import { ContentProviderMetadata } from '../externalContentProvider/externalContentProvider';
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
  const metadata: ContentProviderMetadata = JSON.parse(payload);

  const contentProvider = contentProviderFactory.getProvider(source, metadata);
  if (contentProvider) {
    try {
      // download the bot content zip
      const { eTag, zipPath } = await contentProvider.downloadBotContent();

      // extract zip into new "template" directory
      const baseDir = join(__dirname, '/temp');
      ensureDirSync(baseDir);
      const templateDir = join(baseDir, 'extractedTemplate');
      log('Extracting bot zip...');
      await extractZip(zipPath, { dir: templateDir });
      log('Done extracting.');
      await contentProvider.cleanUp();

      setTimeout(() => {
        res.json({ eTag, templateDir });
      }, 2000);
    } catch (e) {
      const msg = 'Error importing bot content: ' + e;
      log(msg);
      res.status(500).send(msg);
    }
  } else {
    res.status(500).send('No content provider found for source: ' + source);
  }
}

export const ImportController = {
  startImport,
};
