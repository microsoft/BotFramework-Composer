// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  LogData,
  TelemetryEvent,
  TelemetryEventTypes,
  TelemetrySettings,
  TelemetryEventName,
  persistedEvents,
  alwaysTrackEvents,
  piiProperties,
} from '@bfc/shared';
import chunk from 'lodash/chunk';
import fromPairs from 'lodash/fromPairs';

import httpClient from '../utils/httpUtil';

const BATCH_SIZE = 20;

const blankPIIObject = fromPairs(piiProperties.map((p) => [p, null]));

function removePII(data: any) {
  return { ...data, ...blankPIIObject };
}

export default class AppInsightsClient {
  private static _eventPool: TelemetryEvent[] = [];
  private static _intervalId: NodeJS.Timeout | null = null;
  private static _telemetrySettings?: TelemetrySettings;

  public static setup(telemetrySettings: TelemetrySettings) {
    this._telemetrySettings = telemetrySettings;

    // If data collection is enabled, log persisted events to app insights
    if (telemetrySettings.allowDataCollection) {
      this.drain();
    }
  }

  public static trackEvent(name: TelemetryEventName, properties: LogData) {
    if (this._telemetrySettings?.allowDataCollection) {
      this.startInterval();
      this._eventPool.push({ type: TelemetryEventTypes.TrackEvent, name, properties });
      if (this._eventPool.length >= BATCH_SIZE) {
        this.drain();
      }
    } else if (persistedEvents.includes(name)) {
      /**
       * persistedEvents is an array of telemetry events that occur before the user has
       * had a chance to opt in to data collection. These events are added to the event queue;
       * however, they are only logged to Application Insights after the user opts in to data collection.
       */
      this._eventPool.push({ type: TelemetryEventTypes.TrackEvent, name, properties });
    } else if (alwaysTrackEvents.includes(name)) {
      this.postEvents([
        {
          type: TelemetryEventTypes.TrackEvent,
          name,
          properties: properties.enabled ? properties : removePII(properties),
        },
      ]);
    }
  }

  public static logPageView(name: string, url: string, properties: LogData) {
    if (this._telemetrySettings?.allowDataCollection) {
      this.startInterval();
      this._eventPool.push({ type: TelemetryEventTypes.PageView, name, properties, url });
      if (this._eventPool.length >= BATCH_SIZE) {
        this.drain();
      }
    }
  }

  public static drain() {
    if (this._telemetrySettings?.allowDataCollection) {
      const events = this._eventPool.splice(0, this._eventPool.length);
      const batches = chunk(events, BATCH_SIZE);
      return Promise.all(batches.map(this.postEvents));
    }
  }

  private static async postEvents(events: TelemetryEvent[]) {
    try {
      if (events.length) {
        await httpClient.post('/telemetry/events', { events });
      }
    } catch (error) {
      this._eventPool.unshift(...events);
    }
  }

  private static startInterval() {
    if (!this._intervalId) {
      this._intervalId = setInterval(() => {
        if (this._eventPool.length === 0 && this._intervalId !== null) {
          clearInterval(this._intervalId);
          this._intervalId = null;
          return;
        }
        this.drain();
      }, 2000);
    }
  }
}
