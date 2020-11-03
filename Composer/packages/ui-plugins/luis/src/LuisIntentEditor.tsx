// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo } from 'react';
import { LuEditor, inlineModePlaceholder } from '@bfc/code-editor';
import { FieldProps, useShellApi } from '@bfc/extension-client';
import { filterSectionDiagnostics } from '@bfc/indexers';
import { LuIntentSection, CodeEditorSettings, LuMetaData, LuType } from '@bfc/shared';

const LuisIntentEditor: React.FC<FieldProps<string>> = (props) => {
  const { onChange, value, schema, placeholder } = props;

  const {
    currentDialog,
    designerId,
    luFiles,
    shellApi,
    locale,
    projectId,
    userSettings,
    luFeatures = {},
  } = useShellApi();
  const luFile = luFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);

  let intentName = value;
  if (typeof intentName === 'object') {
    const { $kind }: any = schema?.properties || {};
    $kind.const && (intentName = new LuMetaData(new LuType($kind.const).toString(), designerId).toString());
  }

  const luIntent = useMemo(() => {
    return (
      (luFile && luFile.intents.find((intent) => intent.Name === intentName)) ||
      ({
        Name: intentName,
        Body: '',
      } as LuIntentSection)
    );
  }, [intentName]);

  if (!luFile || !intentName) {
    return null;
  }

  const commitChanges = (newValue) => {
    if (!intentName) {
      return;
    }

    const newIntent = { Name: intentName, Body: newValue };
    shellApi.debouncedUpdateLuIntent(luFile.id, intentName, newIntent);
    onChange(intentName);
  };

  const handleSettingsChange = (settings: Partial<CodeEditorSettings>) => {
    shellApi.updateUserSettings({ codeEditor: settings });
  };

  const diagnostics = luFile ? filterSectionDiagnostics(luFile, luIntent.Name) : [];

  return (
    <LuEditor
      diagnostics={diagnostics}
      editorSettings={userSettings.codeEditor}
      height={225}
      luOption={{ fileId: luFile.id, sectionId: luIntent.Name, projectId, luFeatures }}
      placeholder={placeholder || inlineModePlaceholder}
      value={luIntent.Body}
      onChange={commitChanges}
      onChangeSettings={handleSettingsChange}
    />
  );
};

export { LuisIntentEditor };
