// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as fs from 'fs-extra';
import archiver from 'archiver';

import { OnPublishProgress } from './types';

type StepConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appSettings: any;
  sourcePath: string;
  zipPath: string;
};

export const createZipStep = (config: StepConfig, onProgress: OnPublishProgress): Promise<void> => {
  onProgress('Creating zip of bot project...');
  const { appSettings, sourcePath, zipPath } = config;

  const archive = archiver('zip', { zlib: { level: 9 } });
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const stream = fs.createWriteStream(zipPath);
  return new Promise((resolve, reject) => {
    archive
      .glob('**/*', {
        cwd: sourcePath,
        dot: true,
        ignore: ['**/code.zip', '**/settings/appsettings.json'],
      })
      .on('error', (err) => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());

    // write the merged settings to the deploy artifact
    archive.append(JSON.stringify(appSettings, null, 2), { name: 'settings/appsettings.json' });
    archive.finalize();
  });
};
