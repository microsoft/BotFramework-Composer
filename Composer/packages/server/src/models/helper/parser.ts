// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';

import uniqueId from 'lodash/uniqueId';

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

export async function parseQnAContent(url: string) {
  const builder = new qnaBuild.Builder((message: string) => debug(message));

  let qnaContent = '';

  const subscriptionKey = QNA_SUBSCRIPTION_KEY || getBuildEnvironment()?.QNA_SUBSCRIPTION_KEY;

  if (!subscriptionKey) {
    throw new Error('please set env virable QNA_SUBSCRIPTION_KEY={your subscpriont key}');
  }

  if (DOC_EXTENSIONS.some((e) => url.endsWith(e))) {
    const index = url.lastIndexOf('.');
    const extension = url.substring(index);
    qnaContent = await builder.importFileReference(
      `onlineFile${extension}`,
      url,
      subscriptionKey,
      COGNITIVE_SERVICES_ENDPOINTS,
      uniqueId()
    );
  } else {
    qnaContent = await builder.importUrlReference(url, subscriptionKey, COGNITIVE_SERVICES_ENDPOINTS, uniqueId());
  }

  return qnaContent;
}
