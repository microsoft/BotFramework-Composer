// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type TelemetrySettings = {
  allowDataCollection?: boolean;
};

export type ServerSettings = Partial<{ telemetry: TelemetrySettings }>;
