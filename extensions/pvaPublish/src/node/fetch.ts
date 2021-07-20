// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import httpsProxyAgent, { HttpsProxyAgentOptions } from 'https-proxy-agent';

export const proxyAgent = () => {
  const envProxy = process.env.HTTPS_PROXY || process.env.https_proxy;

  if (!envProxy) return undefined;

  const parsed = new URL(envProxy);
  const proxyOpt: HttpsProxyAgentOptions = {
    hostname: parsed.hostname,
    port: parsed.port,
  };

  return httpsProxyAgent(proxyOpt);
};
const fetchWithProxy = (url: RequestInfo, init?: RequestInit): Promise<Response> => {
  const agent = proxyAgent();
  const options = agent ? { agent, ...init } : init;
  return fetch(url, options);
};

export default fetchWithProxy;
