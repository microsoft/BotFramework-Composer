// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ComposerGlobalName } from '../common/constants';
import { validateHookContext } from '../utils/validateHookContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function usePublishApi<T = any>() {
  validateHookContext('publish');

  function setPublishConfig(config: T) {
    window[ComposerGlobalName].setPublishConfig(config);
  }

  function setConfigIsValid(valid: boolean) {
    window[ComposerGlobalName].setConfigIsValid(valid);
  }

  function getPublishConfig(): T | undefined {
    return window[ComposerGlobalName].getPublishConfig();
  }

  return {
    publishConfig: getPublishConfig(),
    setPublishConfig,
    setConfigIsValid,
  };
}
