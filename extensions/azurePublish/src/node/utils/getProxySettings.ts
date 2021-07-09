// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { parse } from 'url';

import { getProxyForUrl } from 'proxy-from-env';

export const getProxySetting = () => {
  const proxyurl = getProxyForUrl();
  if (!proxyurl) return null;
  const proxyObject = parse(proxyurl || '');
  const proxyProtocol = proxyObject.protocol.replace(':', '');
  const proxyPort = proxyObject.port || (proxyProtocol === 'https' ? 443 : 80);
  return { host: proxyObject.host, port: proxyPort };
};
