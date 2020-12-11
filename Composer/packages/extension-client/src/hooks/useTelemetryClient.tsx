// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TelemetryClient } from '@botframework-composer/types';

import { useStore } from './useStore';

export function useTelemetryClient(): TelemetryClient | undefined {
  const shell = useStore();

  return shell.api?.telemetryClient;
}
