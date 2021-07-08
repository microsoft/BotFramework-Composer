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

  function startProvision(config: any, arm: string, graph: string): void {
    return window[ComposerGlobalName].startProvision(config, arm, graph);
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
  function getName(): string {
    return window[ComposerGlobalName].getName();
  }
  function savePublishConfig(config): void {
    return window[ComposerGlobalName].savePublishConfig(config);
  }
  function getTokenFromCache(): { accessToken: string; graphToken: string } {
    return window[ComposerGlobalName].getTokenFromCache();
  }
  function getTenantIdFromCache(): string {
    return window[ComposerGlobalName].getTenantIdFromCache();
  }
  function setTenantId(value): void {
    window[ComposerGlobalName].setTenantId(value);
  }
  function userShouldProvideTokens(): boolean {
    return window[ComposerGlobalName].userShouldProvideTokens();
  }
  function requireUserLogin(tenantId: string, options?: { graph: boolean }): boolean {
    return window[ComposerGlobalName].requireUserLogin(tenantId, options);
  }

  function getRequiredRecognizers(): {
    projectId: string;
    requiresLUIS: boolean;
    requiresQNA: boolean;
  }[] {
    return window[ComposerGlobalName].getRequiredRecognizers();
  }
  /** @deprecated use `userShouldProvideTokens` instead */
  function isGetTokenFromUser(): boolean {
    return window[ComposerGlobalName].userShouldProvideTokens();
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
    getName,
    savePublishConfig,
    getTokenFromCache,
    isGetTokenFromUser,
    userShouldProvideTokens,
    getTenantIdFromCache,
    setTenantId,
    requireUserLogin,
    getRequiredRecognizers,
  };
}
