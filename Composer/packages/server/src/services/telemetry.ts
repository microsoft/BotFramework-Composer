// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as AppInsights from 'applicationinsights';
import { TelemetryEventName, TelemetryEvents, TelemetryEventTypes, TelemetryEvent } from '@bfc/shared';

import logger from '../logger';
import { APPINSIGHTS_INSTRUMENTATIONKEY, piiProperties } from '../constants';
import { useElectronContext } from '../utility/electronContext';
import { getBuildEnvironment } from '../models/utilities/parser';

import { SettingsService } from './settings';
const log = logger.extend('telemetry');

const instrumentationKey = APPINSIGHTS_INSTRUMENTATIONKEY || getBuildEnvironment()?.APPINSIGHTS_INSTRUMENTATIONKEY;

const getTelemetryContext = () => {
  const electronContext = useElectronContext();

  if (electronContext) {
    const { sessionId, machineId, composerVersion } = electronContext;
    const { telemetry = {} } = SettingsService.getSettings();
    return { sessionId, userId: machineId, telemetry, composerVersion };
  }

  return {};
};

let client;
if (instrumentationKey) {
  log('Setting up App Insights');
  AppInsights.setup(instrumentationKey)
    // turn off extra instrumentation
    .setAutoCollectConsole(false)
    .setAutoCollectDependencies(false)
    .setAutoCollectExceptions(false)
    .setAutoCollectPerformance(false)
    .setAutoCollectRequests(true);
  // do not collect the user's machine name
  AppInsights.defaultClient.context.tags[AppInsights.defaultClient.context.keys.cloudRoleInstance] = '';
  AppInsights.defaultClient.addTelemetryProcessor((envelope: AppInsights.Contracts.Envelope, context): boolean => {
    const { sessionId, telemetry, composerVersion, userId } = getTelemetryContext();

    if (!telemetry?.allowDataCollection) {
      return false;
    }
    const data = envelope.data as AppInsights.Contracts.Data<AppInsights.Contracts.RequestData>;

    // Add session id
    envelope.tags[AppInsights.defaultClient.context.keys.sessionId] = sessionId;

    // Add truncated user id
    envelope.tags[AppInsights.defaultClient.context.keys.userId] = userId?.slice(0, Math.floor(userId.length * 0.8));

    // Remove PII from url
    if (envelope.data.baseType === 'RequestData' && data.baseData.url.match(/\/\d+.\d+/i)) {
      if (typeof data.baseData.url === 'string') {
        data.baseData.url = data.baseData.url.replace(/\/\d+.\d+/, '/XXXXX.XXXXXXXXXX');
      }

      if (typeof data.baseData.name === 'string') {
        data.baseData.name = data.baseData.name.replace(/\/\d+.\d+/, '/XXXXX.XXXXXXXXXX');
      }
    }

    if (AppInsights.Contracts.domainSupportsProperties(data.baseData)) {
      data.baseData.properties.toolName = 'bf-composer';

      if (composerVersion) {
        data.baseData.properties.composerVersion = composerVersion;
      }

      // remove PII
      for (const property of piiProperties) {
        if (data.baseData.properties[property] !== undefined) {
          delete data.baseData.properties[property];
        }
      }
    }

    return true;
  });
  log('Starting Application Insights');
  AppInsights.start();
  log('Started Application Insights');
  client = AppInsights.defaultClient;
}

const track = (events: TelemetryEvent[]) => {
  for (const { type, name, properties = {}, url } of events) {
    if (name) {
      try {
        switch (type) {
          case TelemetryEventTypes.TrackEvent:
            client?.trackEvent({ name, properties });
            break;
          case TelemetryEventTypes.PageView:
            client?.trackPageView({ name, url, properties });
            break;
        }
      } catch (error) {
        log('App Insights error: %O', error);
      }
    }
  }
};

const trackEvent = <TN extends TelemetryEventName>(
  name: TN,
  ...args: TelemetryEvents[TN] extends undefined ? [never?] : [TelemetryEvents[TN]]
) => {
  const [properties = {}] = args;
  track([{ type: TelemetryEventTypes.TrackEvent, name, properties }]);
};

const timedEvents = {};

const startEvent = <TN extends TelemetryEventName>(
  name: TN,
  id: string,
  properties?: TelemetryEvents[TN] extends undefined ? never : TelemetryEvents[TN]
) => {
  timedEvents[id] = {
    name,
    properties,
    startTime: Date.now(),
  };
};

const endEvent = <TN extends TelemetryEventName>(eventName: TN, id: string) => {
  if (timedEvents[id]) {
    const { name, properties, startTime } = timedEvents[id];
    if (eventName === name) {
      trackEvent(name, { ...properties, duration: Date.now() - startTime });
      delete timedEvents[id];
    }
  }
};

export const TelemetryService = {
  track,
  trackEvent,
  startEvent,
  endEvent,
};
