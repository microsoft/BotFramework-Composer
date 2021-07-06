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

/**
 * A callback for publishing steps to use to report progress.
 */
export type OnPublishProgress = (status: number, message: string) => void;

/**
 * The configuration input to a publishing step.
 */
export type PublishStepConfig = {
  kind: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

/**
 * A method signature for a step in the publishing process
 */
export type PublishStepMethod = <TConfig, TResult = void>(
  config: TConfig,
  onProgress?: OnPublishProgress
) => Promise<TResult>;
