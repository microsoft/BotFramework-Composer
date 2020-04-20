// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useCallback } from 'react';
import { LuEditor } from '@bfc/code-editor';
import { FieldProps, useShellApi } from '@bfc/extension';
import { filterSectionDiagnostics } from '@bfc/indexers';
import { LuIntentSection, CodeEditorSettings } from '@bfc/shared';
import debounce from 'lodash/debounce';

const LuisIntentEditor: React.FC<FieldProps<string>> = props => {
  const { onChange, value, schema } = props;
  const { currentDialog, designerId, luFiles, shellApi, locale, projectId, userSettings } = useShellApi();
  const luFileId = `${currentDialog.id}.${locale}`;
  const luFile = luFiles.find(f => f.id === luFileId);

  let intentName = value;
  if (typeof intentName === 'object') {
    const { $kind }: any = schema?.properties || {};
    const [, promptType] = $kind.const.split('.');
    promptType && (intentName = `${promptType}.response-${designerId}`);
  }

  const [luIntent, setLuIntent] = useState<LuIntentSection>(
    (luFile && luFile.intents.find(intent => intent.Name === intentName)) ||
      ({
        Name: intentName,
        Body: '',
      } as LuIntentSection)
  );

  if (!luFile || !intentName) {
    return null;
  }

  const updateLuIntent = useCallback(
    debounce((body: string) => {
      if (!intentName) {
        return;
      }
      const newIntent = { Name: intentName, Body: body };
      shellApi.updateLuIntent(luFileId, intentName, newIntent).catch(() => {});
    }, 750),
    [intentName, luFileId]
  );

  const commitChanges = newValue => {
    if (!intentName) {
      return;
    }

    const newIntent = { Name: intentName, Body: newValue };
    setLuIntent(newIntent);
    updateLuIntent(newValue);
    onChange(intentName);
  };

  const handleSettingsChange = (settings: Partial<CodeEditorSettings>) => {
    shellApi.updateUserSettings({ codeEditor: settings });
  };

  const diagnostics = luFile ? filterSectionDiagnostics(luFile.diagnostics, luIntent) : [];

  return (
    <LuEditor
      height={150}
      luOption={{ fileId: luFile.id, sectionId: luIntent.Name, projectId }}
      value={luIntent.Body}
      onChange={commitChanges}
      diagnostics={diagnostics}
      editorSettings={userSettings.codeEditor}
      onChangeSettings={handleSettingsChange}
    />
  );
};

export { LuisIntentEditor };
