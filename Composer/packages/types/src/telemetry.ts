// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type TelemetrySettings = {
  allowDataCollection?: boolean | null;
};

export type ServerSettings = Partial<{ telemetry: TelemetrySettings }>;
