// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LogData, TelemetryEventName, TelemetryEvents, TelemetrySettings } from '@bfc/shared';

import { AggregateClient } from './AggregateClient';
import AppInsightsClient from './AppInsightsClient';
import ConsoleClient from './ConsoleClient';

export default class TelemetryClient {
  private static _additionalProperties?: () => LogData;
  private static _telemetrySettings?: TelemetrySettings;

  public static setup(telemetrySettings: TelemetrySettings, additionalProperties: LogData | (() => LogData)) {
    if (this._telemetrySettings?.allowDataCollection !== telemetrySettings.allowDataCollection) {
      this.client?.drain();
    }

    this._additionalProperties =
      typeof additionalProperties === 'function' ? additionalProperties : () => additionalProperties;
    this._telemetrySettings = telemetrySettings;
  }

  public static track<TN extends TelemetryEventName>(
    eventName: TN,
    properties?: TelemetryEvents[TN] extends undefined ? never : TelemetryEvents[TN]
  ) {
    this.client?.trackEvent(eventName, { ...this.sharedProperties, ...properties });
  }

  public static pageView<TN extends TelemetryEventName>(
    eventName: TN,
    url: string,
    properties?: TelemetryEvents[TN] extends undefined ? never : TelemetryEvents[TN]
  ) {
    this.client?.logPageView(eventName, url, { ...this.sharedProperties, ...properties });
  }

  public static drain() {
    return this.client?.drain();
  }

  private static get client() {
    if (this._telemetrySettings?.allowDataCollection) {
      if (process.env.NODE_ENV !== 'development') {
        return AppInsightsClient;
      } else {
        return AggregateClient(AppInsightsClient, ConsoleClient);
      }
    }
  }

  private static get sharedProperties(): Record<string, unknown> {
    return {
      ...this._additionalProperties?.(),
      timestamp: Date.now(),
      composerVersion: process.env.COMPOSER_VERSION || 'unknown',
      sdkPackageVersion: process.env.SDK_PACKAGE_VERSION || 'unknown',
    };
  }
}
