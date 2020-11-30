// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LogData, TelemetryLogger, TelemetryEventTypes, TelemetryEvent } from '@bfc/shared';

import httpClient from '../utils/httpUtil';

export const appInsightsLogger = (): TelemetryLogger => {
  const eventPool: TelemetryEvent[] = [];

  const flush = async () => {
    if (eventPool.length) {
      try {
        const events = eventPool.splice(0, 20);
        await httpClient.post('/telemetry/events', { events });
      } catch (error) {
        // Swallow error to avoid crashing the app while sending telemetry
      }
    }
  };

  setInterval(() => {
    flush();
  }, 5000);

  const logEvent = (name: string, properties?: LogData) => {
    eventPool.push({ type: TelemetryEventTypes.TrackEvent, name, properties });
  };

  const logPageView = (name: string, url: string, properties?: LogData) => {
    eventPool.push({ type: TelemetryEventTypes.PageView, name, url, properties });
  };

  return {
    logEvent,
    logPageView,
    flush,
  };
};

const logger = {
  current: appInsightsLogger(),
};

export const getApplicationInsightsLogger = () => {
  return logger.current;
};
