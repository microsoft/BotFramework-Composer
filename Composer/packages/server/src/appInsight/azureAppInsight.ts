import { TelemetryClient } from 'applicationinsights';

import settings from '../settings/settings';

import { IAppInsight } from './appInsightClient';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const appInsights = require('applicationinsights');

class AzureAppInsight implements IAppInsight {
  private appInsights: TelemetryClient;
  constructor() {
    if (!settings.instrumentationKey) {
      throw new Error('no instrumentation key to use application insight');
    } else {
      appInsights
        .setup(settings.instrumentationKey)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(true)
        .start();
      this.appInsights = appInsights.defaultClient;
    }
  }
  trackException(exception: Error): void {
    this.appInsights.trackException({
      exception: exception,
    });
  }
}

export const azureAppInsight = new AzureAppInsight();
