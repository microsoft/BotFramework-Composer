// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// This is the incoming config type for PublishPlugin.publish
export type PublishConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fullSettings: any;
  profileName: string; //profile name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export type OnDeploymentProgress = (status: number, message: string) => void;

export type PublishingWorkingSet = Record<string, object>;

export type PublishStep = {
  execute: (workingSet: PublishingWorkingSet, onProgress: OnDeploymentProgress) => Promise<void>;
};
