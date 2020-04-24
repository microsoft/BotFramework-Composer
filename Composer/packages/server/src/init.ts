// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getPortPromise } from 'portfinder';

import { start } from './server';

(async () => {
  const availablePort = await getPortPromise();
  process.env.FALLBACK_PORT = availablePort.toString();
  await start();
})().catch(err => {
  console.error('Error occurred while starting server: ', err);
});
