// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TelemetryClient } from '@bfc/shared';

export const mockTelemetryClient: TelemetryClient = {
  track: () => {},
  pageView: () => {},
};
