// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import httpClient from './httpUtil';

enum PollingStateEnum {
  Closed,
  Open,
}

export enum ApiStatus {
  Publishing = 202,
  Success = 200,
  Failed = 500,
  Unknown = 404,
}

export class PublishStatusPollingUpdater {
  private status;
  private timerId;
  private targetName;
  private botProjectId;
  private pollingInterval = 10000;

  constructor(botProjectId: string, publishTargetId: string) {
    this.botProjectId = botProjectId;
    this.targetName = publishTargetId;
  }

  async start(onData, onAction) {
    if (!(this.botProjectId && this.targetName)) return;
    if (this.status === PollingStateEnum.Open) return;
    try {
      this.status = PollingStateEnum.Open;

      const firstResponse = await httpClient.get(`/publish/${this.botProjectId}/status/${this.targetName}`);
      onData && onData({ botProjectId: this.botProjectId, targetName: this.targetName, apiResponse: firstResponse });
      this.timerId = window.setInterval(async () => {
        try {
          const response = await httpClient.get(`/publish/${this.botProjectId}/status/${this.targetName}`);
          onData && onData({ botProjectId: this.botProjectId, targetName: this.targetName, apiResponse: response });
          onAction && onAction({ botProjectId: this.botProjectId, targetName: this.targetName, apiResponse: response });
        } catch (err) {
          onData && onData({ botProjectId: this.botProjectId, targetName: this.targetName, apiResponse: err.response });
          onAction &&
            onAction({ botProjectId: this.botProjectId, targetName: this.targetName, apiResponse: err.response });
        }
      }, this.pollingInterval);
    } catch (err) {
      onData && onData({ botProjectId: this.botProjectId, targetName: this.targetName, apiResponse: err.response });
      onAction && onAction({ botProjectId: this.botProjectId, targetName: this.targetName, apiResponse: err.response });
    }
  }

  stop() {
    if (this.timerId) {
      window.clearInterval(this.timerId);
    }
    this.timerId = 0;
    this.status = PollingStateEnum.Closed;
  }

  restart(onData, onAction) {
    this.stop();
    this.start(onData, onAction);
  }

  isSameUpdater(botProjectId, targetName) {
    return this.botProjectId === botProjectId && this.targetName === targetName;
  }
}
export const pollingUpdaterList: PublishStatusPollingUpdater[] = [];
