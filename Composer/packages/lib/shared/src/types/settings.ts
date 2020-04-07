// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface CodeEditorSettings {
  lineNumbers: boolean;
  wordWrap: boolean;
}

export interface UserSettings {
  codeEditor: CodeEditorSettings;
  propertyEditor: {
    width: number;
  };
}
