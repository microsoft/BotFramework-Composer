// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ComposerGlobalName } from '../common/constants';
import { PublishConfig } from './types';

export function setPublishConfig(config: PublishConfig) {
  window[ComposerGlobalName].setPublishConfig(config);
}

export function setConfigIsValid(valid: boolean) {
  window[ComposerGlobalName].setConfigIsValid(valid);
}

export function useConfigBeingEdited(): PublishConfig[] | undefined[] {
  return window[ComposerGlobalName].useConfigBeingEdited();
}
