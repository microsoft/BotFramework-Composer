// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ComposerGlobalName } from '../common/constants';
import { validateHookContext } from '../utils/validateHookContext';

export interface PublishConfig {
  [key: string]: any;
}

export function usePublishApi() {
  validateHookContext('publish');

  function getPublishConfig(): PublishConfig | undefined {
    return window[ComposerGlobalName].getPublishConfig();
  }

  function startProvision(config: any): void {
    return window[ComposerGlobalName].startProvision(config);
  }

  function currentProjectId(): string {
    return window[ComposerGlobalName].currentProjectId();
  }

  function closeDialog(): void {
    return window[ComposerGlobalName].closeDialog();
  }

  function onBack(): void {
    return window[ComposerGlobalName].onBack();
  }
  function setTitle(value): void {
    return window[ComposerGlobalName].setTitle(value);
  }
  function getSchema(): any {
    return window[ComposerGlobalName].getSchema();
  }
  function getType(): string {
    return window[ComposerGlobalName].getType();
  }
  function savePublishConfig(config): void {
    return window[ComposerGlobalName].savePublishConfig(config);
  }
  function getTokenFromCache(): { accessToken: string; graphToken: string } {
    return window[ComposerGlobalName].getTokenFromCache();
  }
  function isGetTokenFromUser(): boolean {
    return window[ComposerGlobalName].isGetTokenFromUser();
  }

  return {
    publishConfig: getPublishConfig(),
    startProvision,
    currentProjectId,
    closeDialog,
    onBack,
    setTitle,
    getSchema,
    getType,
    savePublishConfig,
    getTokenFromCache,
    isGetTokenFromUser,
  };
}
