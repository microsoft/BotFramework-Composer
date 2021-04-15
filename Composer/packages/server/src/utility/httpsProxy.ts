// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import httpsProxyAgent, { HttpsProxyAgentOptions } from 'https-proxy-agent';

const httpsProxy = (config) => {
  const parsed = new URL(config.url);
  const protocol = parsed.protocol;
  if (protocol !== 'https:') {
    return config;
  }

  const envProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (envProxy) {
    const parsed = new URL(envProxy);
    const proxyOpt: HttpsProxyAgentOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
    };

    config.httpsAgent = httpsProxyAgent(proxyOpt);
    //Disable direct proxy
    config.proxy = false;
  }

  return config;
};

export default httpsProxy;
