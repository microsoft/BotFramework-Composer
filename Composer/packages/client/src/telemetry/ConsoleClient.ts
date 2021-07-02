/* eslint-disable no-console */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  LogData,
  persistedEvents,
  TelemetryEvent,
  TelemetryEventName,
  TelemetryEventTypes,
  TelemetrySettings,
} from '@botframework-composer/types';

export default class ConsoleClient {
  private static _telemetrySettings?: TelemetrySettings;
  private static _eventPool: TelemetryEvent[] = [];

  public static setup(telemetrySettings: TelemetrySettings) {
    this._telemetrySettings = telemetrySettings;

    // If data collection is enabled, log persisted events to console
    if (telemetrySettings.allowDataCollection) {
      this.drain();
    }
  }

  public static trackEvent(name: string, properties: LogData) {
    if (this._telemetrySettings?.allowDataCollection) {
      console.log('bfc-telemetry', { type: TelemetryEventTypes.TrackEvent, name, properties });
    } else if (persistedEvents.includes(name as TelemetryEventName)) {
      /**
       * persistedEvents is an array of telemetry events that occur before the user has
       * had a chance to opt in to data collection. These events are added to the event queue;
       * however, they are only logged to Application Insights after the user opts in to data collection.
       */
      this._eventPool.push({ type: TelemetryEventTypes.TrackEvent, name, properties });
    }
  }

  public static logPageView(name: string, url: string, properties: LogData) {
    if (this._telemetrySettings?.allowDataCollection) {
      console.log('bfc-telemetry', { type: TelemetryEventTypes.PageView, name, url, properties });
    }
  }

  public static drain() {
    if (this._telemetrySettings?.allowDataCollection) {
      const events = this._eventPool.splice(0, this._eventPool.length);
      events.forEach((event) => console.log('bfc-telemetry', event));
    }
  }
}
