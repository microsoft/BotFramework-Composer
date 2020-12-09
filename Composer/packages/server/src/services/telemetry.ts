// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as AppInsights from 'applicationinsights';
import { TelemetryEventName, TelemetryEvents, TelemetryEventTypes, TelemetryEvent } from '@bfc/shared';

import logger from '../logger';
import { APPINSIGHTS_INSTRUMENTATIONKEY, piiProperties } from '../constants';
import { useElectronContext } from '../utility/electronContext';
import { getBuildEnvironment } from '../models/utilities/parser';

import { SettingsService } from './settings';
const log = logger.extend('telemetry-service');

const instrumentationKey = APPINSIGHTS_INSTRUMENTATIONKEY || getBuildEnvironment()?.APPINSIGHTS_INSTRUMENTATIONKEY;
const getTelemetryContext = () => {
  const electronContext = useElectronContext();

  if (electronContext) {
    const { sessionId, machineId } = electronContext;
    const { telemetry = {} } = SettingsService.getSettings();
    return { sessionId, userId: machineId, telemetry };
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
    const { sessionId, userId, telemetry } = getTelemetryContext();

    if (!telemetry?.allowDataCollection) {
      return false;
    }
    const data = envelope.data as AppInsights.Contracts.Data<AppInsights.Contracts.Domain>;

    if (AppInsights.Contracts.domainSupportsProperties(data.baseData)) {
      data.baseData.properties.toolName = 'bf-composer';
      data.baseData.properties.sessionId = sessionId;
      data.baseData.properties.userId = userId;

      // remove PII
      for (const property of piiProperties) {
        if (data.baseData.properties[property]) {
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
        log('App Insights error: %s', error.message || '');
        // swallow the exception on a failed attempt to collect usage data
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

export const TelemetryService = {
  track,
  trackEvent,
};
