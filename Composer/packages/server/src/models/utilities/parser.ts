// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';

import { v4 as uuid } from 'uuid';

import { Path } from '../../utility/path';

import log from './../../logger';
import { DOC_EXTENSIONS, QNA_SUBSCRIPTION_KEY, COGNITIVE_SERVICES_ENDPOINTS } from './../../constants';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const qnaBuild = require('@microsoft/bf-lu/lib/parser/qnabuild/builder.js');

const debug = log.extend('helper-parser');

const BuildEnvPath = Path.join(__dirname, '../../env.json');

function getBuildEnvironment() {
  if (fs.existsSync(BuildEnvPath)) {
    return JSON.parse(fs.readFileSync(BuildEnvPath, 'utf-8'));
  }

  return {};
}

export async function parseQnAContent(urls: string[]) {
  const builder = new qnaBuild.Builder((message: string) => debug(message));

  let qnaContent = '';

  const subscriptionKey = QNA_SUBSCRIPTION_KEY || getBuildEnvironment()?.QNA_SUBSCRIPTION_KEY;

  if (!subscriptionKey) {
    throw new Error('Missing subscription key for QnAMaker');
  }

  const contents = await Promise.all(
    urls.map(async (url) => {
      url = url.trim();
      if (DOC_EXTENSIONS.some((e) => url.endsWith(e))) {
        const index = url.lastIndexOf('.');
        const extension = url.substring(index);
        return await builder.importFileReference(
          `onlineFile${extension}`,
          url,
          subscriptionKey,
          COGNITIVE_SERVICES_ENDPOINTS,
          uuid()
        );
      } else {
        return await builder.importUrlReference(url, subscriptionKey, COGNITIVE_SERVICES_ENDPOINTS, uuid());
      }
    })
  );

  contents.forEach((content) => {
    qnaContent += content;
  });
  return qnaContent;
}
