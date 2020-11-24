// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LogData, TelemetryLogger, TelemetryEventTypes } from '@bfc/shared';

import httpClient from '../utils/httpUtil';

type Event = {
  type: TelemetryEventTypes;
  name: string;
  url?: string;
  properties?: LogData;
};

export const appInsightsLogger = (): TelemetryLogger => {
  const events: Event[] = [];

  const shift = async () => {
    const event = events.shift();
    if (event) {
      try {
        await httpClient.post('/telemetry/event', event);
      } catch (error) {
        // Swallow error to avoid crashing the app while sending telemetry
      }
    }
  };

  setInterval(() => {
    shift();
  }, 5000);

  const logEvent = (name: string, properties?: LogData) => {
    events.push({ type: TelemetryEventTypes.TrackEvent, name, properties });
  };

  const logPageView = (name: string, url: string, properties?: LogData) => {
    events.push({ type: TelemetryEventTypes.PageView, name, url, properties });
  };

  const flush = () => {
    while (events.length) {
      shift();
    }
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
