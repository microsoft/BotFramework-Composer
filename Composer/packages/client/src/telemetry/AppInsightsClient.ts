// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LogData, TelemetryEvent, TelemetryEventTypes } from '@bfc/shared';
import chunk from 'lodash/chunk';

import httpClient from '../utils/httpUtil';

const BATCH_SIZE = 20;
export default class AppInsightsClient {
  private static _eventPool: TelemetryEvent[] = [];
  private static _intervalId: NodeJS.Timeout | null = null;

  public static logEvent(name: string, properties: LogData) {
    this.startInterval();
    this._eventPool.push({ type: TelemetryEventTypes.TrackEvent, name, properties });
  }

  public static logPageView(name: string, url: string, properties: LogData) {
    this.startInterval();
    this._eventPool.push({ type: TelemetryEventTypes.PageView, name, properties, url });
  }

  public static drain() {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }

    const batches = chunk(this._eventPool, BATCH_SIZE);
    Promise.all(batches.map(this.postEvents));
  }

  private static async flush() {
    if (this._eventPool.length) {
      const events = this._eventPool.splice(0, BATCH_SIZE);
      await this.postEvents(events);
    }
  }

  private static async postEvents(events: TelemetryEvent[]) {
    try {
      await httpClient.post('/telemetry/events', { events });
    } catch (error) {
      // Swallow error to avoid crashing the app while sending telemetry
    }
  }

  private static startInterval() {
    if (!this._intervalId) {
      this._intervalId = setInterval(() => {
        this.flush();
      }, 10000);
    }
  }
}
