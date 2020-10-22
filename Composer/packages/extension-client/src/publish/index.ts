// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ComposerGlobalName } from '../common/constants';

import { PublishConfig } from './types';

/** methods for publish */
export function setPublishConfig(config: PublishConfig) {
  window[ComposerGlobalName].setPublishConfig(config);
}

export function setConfigIsValid(valid: boolean) {
  window[ComposerGlobalName].setConfigIsValid(valid);
}

export function useConfigBeingEdited(): PublishConfig[] | undefined[] {
  return window[ComposerGlobalName].useConfigBeingEdited();
}

// export function startProvision(config: any): void {
//   return window[ComposerGlobalName].startProvision(config);
// }

/** methods for provision */
export function currentProjectId(): string {
  return window[ComposerGlobalName].currentProjectId();
}

export function setProvisionConfig(config): void {
  return window[ComposerGlobalName].setProvisionConfig(config);
}
export function getProvisionConfig(): any {
  return window[ComposerGlobalName].getProvisionConfig;
}
export function currentPage(): string {
  return window[ComposerGlobalName].currentPage();
}
// export function closeDialog(): void {
//   return window[ComposerGlobalName].closeDialog();
// }
