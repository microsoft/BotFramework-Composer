// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type OnDeploymentProgress = (status: number, message: string) => void;

export type PublishingWorkingSet = Record<string, object>;

export type PublishStep = {
  execute: (workingSet: PublishingWorkingSet, onProgress: OnDeploymentProgress) => Promise<void>;
};
