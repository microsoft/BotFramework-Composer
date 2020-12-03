// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LogData, TelemetryEventName, TelemetryEvents, TelemetrySettings } from '@bfc/shared';

import AppInsightsClient from './AppInsightsClient';
import ConsoleClient from './ConsoleClient';

export default class TelemetryClient {
  private static _getProperties?: () => LogData;
  private static _telemetrySettings?: TelemetrySettings;

  public static setup(telemetrySettings: TelemetrySettings, additionalProperties: LogData | (() => LogData)) {
    if (this._telemetrySettings?.allowDataCollection !== telemetrySettings.allowDataCollection) {
      this.client?.drain();
    }

    this._getProperties =
      typeof additionalProperties === 'function' ? additionalProperties : () => additionalProperties;
    this._telemetrySettings = telemetrySettings;
  }

  public static log<TN extends TelemetryEventName>(
    eventName: TN,
    ...args: TelemetryEvents[TN] extends undefined ? [never?] : [TelemetryEvents[TN]]
  ) {
    const [properties] = args;
    this.client?.logEvent(eventName, { ...this._getProperties?.(), ...properties });
  }

  public static pageView<TN extends TelemetryEventName>(
    eventName: TN,
    url: string,
    ...args: TelemetryEvents[TN] extends undefined ? [never?] : [TelemetryEvents[TN]]
  ) {
    const [properties] = args;
    this.client?.logPageView(eventName, url, { ...this._getProperties?.(), ...properties });
  }

  public static drain() {
    this.client?.drain();
  }

  private static get client() {
    if (this._telemetrySettings?.allowDataCollection) {
      if (process.env.NODE_ENV !== 'development') {
        return AppInsightsClient;
      } else {
        return ConsoleClient;
      }
    }
  }
}
