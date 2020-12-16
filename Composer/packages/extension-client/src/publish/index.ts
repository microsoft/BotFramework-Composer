// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ComposerGlobalName } from '../common/constants';

import { PublishConfig } from './types';

export function useConfigBeingEdited(): PublishConfig[] | undefined[] {
  return window[ComposerGlobalName].useConfigBeingEdited();
}

export function startProvision(config: any): void {
  return window[ComposerGlobalName].startProvision(config);
}

export function currentProjectId(): string {
  return window[ComposerGlobalName].currentProjectId();
}

export function closeDialog(): void {
  return window[ComposerGlobalName].closeDialog();
}

export function onBack(): void {
  return window[ComposerGlobalName].onBack();
}
export function setTitle(value): void {
  return window[ComposerGlobalName].setTitle(value);
}
export function getSchema(): any {
  return window[ComposerGlobalName].getSchema();
}
export function getType(): string {
  return window[ComposerGlobalName].getType();
}
export function savePublishConfig(config): void {
  return window[ComposerGlobalName].savePublishConfig(config);
}
export function getTokenFromCache(): { accessToken: string; graphToken: string } {
  return window[ComposerGlobalName].getTokenFromCache();
}
export function isGetTokenFromUser(): boolean {
  return window[ComposerGlobalName].isGetTokenFromUser();
}
