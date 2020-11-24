// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as AppInsights from 'applicationinsights';
import { TelemetryEventName, TelemetryEvents, TelemetryEventTypes } from '@bfc/shared';

import { SettingsService } from './settings';
import { APPINSIGHTS_INSTRUMENTATIONKEY, piiProperties } from '../constants';
import { useElectronContext } from '../utility/electronContext';

let client;
if (APPINSIGHTS_INSTRUMENTATIONKEY) {
  AppInsights.setup(APPINSIGHTS_INSTRUMENTATIONKEY)
    // turn off extra instrumentation
    .setAutoCollectConsole(false)
    .setAutoCollectDependencies(false)
    .setAutoCollectExceptions(false)
    .setAutoCollectPerformance(false)
    .setAutoCollectRequests(true);
  // do not collect the user's machine name
  AppInsights.defaultClient.context.tags[AppInsights.defaultClient.context.keys.cloudRoleInstance] = '';
  AppInsights.defaultClient.addTelemetryProcessor((envelope: AppInsights.Contracts.Envelope, context): boolean => {
    const { telemetry: { allowDataCollection } = {} } = SettingsService.getSettings();
    const electionContext = useElectronContext();

    const data = envelope.data as AppInsights.Contracts.Data<AppInsights.Contracts.Domain>;

    if (AppInsights.Contracts.domainSupportsProperties(data.baseData)) {
      data.baseData.properties.toolName = 'bf-composer';

      if (electionContext?.machineId) {
        data.baseData.properties.userId = electionContext.machineId;
      }

      // remove PII
      for (const property of piiProperties) {
        if (data.baseData.properties[property]) {
          delete data.baseData.properties[property];
        }
      }
    }

    return !!allowDataCollection;
  });
  AppInsights.start();
  client = AppInsights.defaultClient;
}

const track = (type: TelemetryEventTypes, name: string, properties: Record<string, string> = {}, url?: string) => {
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
      // swallow the exception on a failed attempt to collect usage data
    }
  }
};

const trackEvent = <TN extends TelemetryEventName>(
  name: TN,
  ...args: TelemetryEvents[TN] extends undefined ? [never?] : [TelemetryEvents[TN]]
) => {
  const [properties = {}] = args;
  track(TelemetryEventTypes.TrackEvent, name, properties);
};

export const TelemetryService = {
  track,
  trackEvent,
};
