// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface CodeEditorSettings {
  lineNumbers: boolean;
  wordWrap: boolean;
  minimap: boolean;
}

export interface UserSettings {
  appUpdater: AppUpdaterSettings;
  codeEditor: CodeEditorSettings;
  propertyEditorWidth: number;
  dialogNavWidth: number;
}

export interface AppUpdaterSettings {
  autoDownload: boolean;
  useNightly: boolean;
}
