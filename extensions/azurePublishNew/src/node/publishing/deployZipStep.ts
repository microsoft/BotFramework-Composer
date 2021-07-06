// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as fs from 'fs-extra';
import axios from 'axios';

import { OnPublishProgress } from './types';

const waitForZipDeploy = async (
  accessToken: string,
  statusUrl: string,
  onProgress: OnPublishProgress
): Promise<void> => {
  onProgress(202, 'Waiting for zip upload processing.');

  return new Promise((resolve, reject) => {
    const timerId = setInterval(async () => {
      try {
        const statusResponse = await axios.get(statusUrl, { headers: { Authorization: `Bearer ${accessToken}` } });

        if (statusResponse.data.provisioningState === 'Succeeded') {
          onProgress(202, 'Zip upload processed successfully.');
          clearInterval(timerId);
          resolve();
        } else if (statusResponse.data.provisioningState === 'Failed') {
          clearInterval(timerId);
          reject(`Zip upload processing failed. ${statusResponse.data.status_text}`);
        } else {
          onProgress(202, `Waiting for zip upload processing. ${statusResponse.data.status_text}`);
        }
      } catch (err) {
        const errorMessage = JSON.stringify(err, Object.getOwnPropertyNames(err));
        clearInterval(timerId);
        reject(`Getting status of zip upload processing failed. ${errorMessage}`);
      }
    }, 5000);
  });
};

type StepConfig = {
  accessToken: string;
  name: string;
  environment: string;
  hostname?: string;
  zipPath: string;
};

export const deployZipStep = async (config: StepConfig, onProgress: OnPublishProgress): Promise<void> => {
  const { accessToken, name, environment, zipPath } = config;

  const hostname = config.hostname ?? `${name}${environment ? '-' + environment : ''}`;
  onProgress(202, `Uploading zip file... to ${hostname}`);

  const publishEndpoint = `https://${hostname}.scm.azurewebsites.net/zipdeploy/?isAsync=true`;

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const fileReadStream = fs.createReadStream(zipPath, { autoClose: true });
  fileReadStream.on('error', function (err) {
    this.logger('%O', err);
    throw err;
  });

  try {
    const response = await axios.post(publishEndpoint, fileReadStream, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/x-zip-compressed' },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (response.status === 202) {
      await waitForZipDeploy(accessToken, response.headers.location, onProgress);
    }
  } catch (err) {
    // close file read stream
    fileReadStream.close();
    if (err.statusCode === 403) {
      throw new Error(
        `Token expired, please run az account get-access-token, then replace the accessToken in your configuration. ${err}`
      );
    } else {
      throw new Error(`There was a problem publishing bot assets (zip deploy). ${err}`);
    }
  }
};
