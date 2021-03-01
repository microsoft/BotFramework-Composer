// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { publishStorage } from '../recoilModel/dispatchers/publisher';

import httpClient from './httpUtil';

enum PollingStateEnum {
  Stopped,
  Running,
}

export enum ApiStatus {
  Publishing = 202,
  Success = 200,
  Failed = 500,
  Unknown = 404,
  HeaderTooLarge = 431,
  BadRequest = 400,
}

interface OnDataPayload {
  botProjectId: string;
  targetName: string;
  apiResponse: any;
}
type OnDataHandler = (payload: OnDataPayload) => void;

export class PublishStatusPollingUpdater {
  private status: PollingStateEnum = PollingStateEnum.Stopped;
  private timerId = 0;
  private publishTargetName: string;
  private botProjectId: string;
  private pollingInterval;

  constructor(botProjectId: string, publishTargetId: string, pollingInterval = 10000) {
    this.botProjectId = botProjectId;
    this.publishTargetName = publishTargetId;
    this.pollingInterval = pollingInterval;
  }

  private async fetchPublishStatusData(botProjectId: string, publishTargetName: string, onData: OnDataHandler) {
    // TODO: DONT set HTTP Status code with 500 404 directly!
    const currentJobId = publishStorage.get('jobIds')
      ? publishStorage.get('jobIds')[`${botProjectId}-${publishTargetName}`]
      : undefined;
    if (!currentJobId) {
      return;
    }
    const response = await httpClient
      .get(`/publish/${this.botProjectId}/status/${this.publishTargetName}/${currentJobId}`)
      .catch((reason) => reason.response);

    onData({
      botProjectId,
      targetName: publishTargetName,
      apiResponse: response,
    });
  }

  async start(onData: OnDataHandler) {
    if (!this.botProjectId || !this.publishTargetName) {
      console.error(new Error('botProjectId & publishTargetName should not be empty.'));
      return;
    }
    if (typeof onData !== 'function') {
      console.error(new Error('onData should be a function.'));
      return;
    }
    if (this.status === PollingStateEnum.Running) return;

    this.status = PollingStateEnum.Running;

    this.fetchPublishStatusData(this.botProjectId, this.publishTargetName, onData);
    this.timerId = window.setInterval(
      async () => this.fetchPublishStatusData(this.botProjectId, this.publishTargetName, onData),
      this.pollingInterval
    );
  }

  stop() {
    if (this.timerId) {
      window.clearInterval(this.timerId);
    }
    this.timerId = 0;
    this.status = PollingStateEnum.Stopped;
  }

  restart(onData: OnDataHandler) {
    this.stop();
    this.start(onData);
  }

  isSameUpdater(botProjectId: string, targetName: string) {
    return this.botProjectId === botProjectId && this.publishTargetName === targetName;
  }
}

export const pollingUpdaterList: PublishStatusPollingUpdater[] = [];
