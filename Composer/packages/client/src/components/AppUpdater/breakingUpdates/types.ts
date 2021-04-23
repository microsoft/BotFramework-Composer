// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type BreakingUpdateProps = {
  explicitCheck: boolean;
  /** Called when the user dismisses the breaking changes UX; stops the update flow completely. */
  onCancel: () => void;
  /** Called when the breaking changes UX is ready to continue into the normal update flow. */
  onContinue: () => void;
  version?: string;
};
