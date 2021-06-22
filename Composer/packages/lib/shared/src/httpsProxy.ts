// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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

export const httpsProxy = (config) => {
  const parsed = new URL(config.url);
  const protocol = parsed.protocol;
  if (protocol !== 'https:') {
    return config;
  }

  const agent = proxyAgent();
  if (agent) {
    config.httpsAgent = agent;
    //Disable direct proxy
    config.proxy = false;
  }

  return config;
};
