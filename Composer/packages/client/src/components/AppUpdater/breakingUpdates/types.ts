// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AppUpdaterSettings } from '@bfc/shared';

export type BreakingUpdateProps = {
  updateSettings: AppUpdaterSettings;
  /** Called when the user dismisses the breaking changes UX; stops the update flow completely. */
  onCancel: () => void;
  /** Called when the breaking changes UX is ready to continue into the normal update flow. */
  onContinue: () => void;
  version?: string;
};
