// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LogData, TelemetryEvent, TelemetryEventTypes } from '@bfc/shared';
import chunk from 'lodash/chunk';

import httpClient from '../utils/httpUtil';

const BATCH_SIZE = 20;
export default class AppInsightsClient {
  private static _eventPool: TelemetryEvent[] = [];
  private static _intervalId: NodeJS.Timeout | null = null;

  public static trackEvent(name: string, properties: LogData) {
    this.startInterval();
    this._eventPool.push({ type: TelemetryEventTypes.TrackEvent, name, properties });
    if (this._eventPool.length >= BATCH_SIZE) {
      this.drain();
    }
  }

  public static logPageView(name: string, url: string, properties: LogData) {
    this.startInterval();
    this._eventPool.push({ type: TelemetryEventTypes.PageView, name, properties, url });
    if (this._eventPool.length >= BATCH_SIZE) {
      this.drain();
    }
  }

  public static drain() {
    const events = this._eventPool.splice(0, this._eventPool.length);
    const batches = chunk(events, BATCH_SIZE);
    return Promise.all(batches.map(this.postEvents));
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
