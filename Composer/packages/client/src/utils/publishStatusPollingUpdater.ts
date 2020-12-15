// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import httpClient from './httpUtil';

enum CircuitBreakerStateEnum {
  Closed,
  Open,
}

export const ApiStatus = {
  Publishing: 202,
  Success: 200,
  Failed: 500,
  UNKNOW: 404,
};

export class PublishStatusPollingUpdater {
  private status;
  private timerId;
  private targetName;
  private botProjectId;
  private pollingInterval = 10000;

  constructor({ botProjectId, targetName }) {
    this.botProjectId = botProjectId;
    this.targetName = targetName;
  }

  async start(onData) {
    if (!(this.botProjectId && this.targetName)) return;
    if (this.status === CircuitBreakerStateEnum.Open) return;
    this.status = CircuitBreakerStateEnum.Open;
    this.timerId = window.setInterval(async () => {
      try {
        const response = await httpClient.get(`/publish/${this.botProjectId}/status/${this.targetName}`);
        onData && onData({ botProjectId: this.botProjectId, targetName: this.targetName, apiResponse: response });
      } catch (err) {
        console.log(this.timerId);
        onData && onData({ botProjectId: this.botProjectId, targetName: this.targetName, apiResponse: err.response });
      }
    }, this.pollingInterval);
  }
  stop() {
    if (this.timerId) {
      window.clearInterval(this.timerId);
    }
    this.timerId = 0;
    this.status = CircuitBreakerStateEnum.Closed;
  }
  restart(onData) {
    this.stop();
    this.start(onData);
  }
  beEqual(botProjectId, targetName) {
    return this.botProjectId === botProjectId && this.targetName === targetName;
  }
}
