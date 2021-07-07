// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * A callback for publishing steps to use to report progress.
 */
export type OnPublishProgress = (message: string, status?: number) => void;

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
