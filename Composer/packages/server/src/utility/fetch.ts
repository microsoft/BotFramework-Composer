// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';

import { proxyAgent } from './httpsProxy';

const fetchWithProxy = (url: RequestInfo, init?: RequestInit): Promise<Response> => {
  const agent = proxyAgent();
  const options = agent ? { agent, ...init } : init;
  return fetch(url, options);
};

export default fetchWithProxy;
