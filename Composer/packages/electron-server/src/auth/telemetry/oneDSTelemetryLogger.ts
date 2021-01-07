// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { app } from 'electron';

import { OneAuth } from '../oneauth';

const { ApplicationInsights } = require('./ms.analytics-web.min.js'); // eslint-disable-line

const analytics = new ApplicationInsights();
const config = {
  instrumentationKey: 'YOUR_TENANT_KEY',
  extensions: [], // Extra plugins
  extensionConfig: [], // Config for extra plugins
  channelConfiguration: {
    eventsLimitInMem: 50,
  },
  propertyConfiguration: {
    userAgent: `BotFramework-Composer/${app.getVersion()}`,
  },
};
analytics.initialize(config, []);
// Send telemetry
analytics.track({ name: 'customEvent' });

export const telemetryDispatcher = (data: OneAuth.Data) => {
  console.log('Got data: ', data);

  // TODO: map OneAuth data to an event digestible by 1DS

  analytics.track({ name: 'someEvent' });
};
