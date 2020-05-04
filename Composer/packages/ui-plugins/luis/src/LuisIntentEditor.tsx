// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import { LuEditor, inlineModePlaceholder } from '@bfc/code-editor';
import { FieldProps, useShellApi } from '@bfc/extension';
import { filterSectionDiagnostics } from '@bfc/indexers';
import { LuIntentSection, CodeEditorSettings, LuMetaData, LuType } from '@bfc/shared';

const LuisIntentEditor: React.FC<FieldProps<string>> = props => {
  const { onChange, value, schema, placeholder } = props;
  const { currentDialog, designerId, luFiles, shellApi, locale, projectId, userSettings } = useShellApi();
  const luFile = luFiles.find(f => f.id === `${currentDialog.id}.${locale}`);

  let intentName = value;
  if (typeof intentName === 'object') {
    const { $kind }: any = schema?.properties || {};
    $kind.const && (intentName = new LuMetaData(new LuType($kind.const).toString(), designerId).toString());
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

  const commitChanges = newValue => {
    if (!intentName) {
      return;
    }

    const newIntent = { Name: intentName, Body: newValue };
    setLuIntent(newIntent);
    shellApi.updateLuIntent(luFile.id, intentName, newIntent);
    onChange(intentName);
  };

  const handleSettingsChange = (settings: Partial<CodeEditorSettings>) => {
    shellApi.updateUserSettings({ codeEditor: settings });
  };

  const diagnostics = luFile ? filterSectionDiagnostics(luFile.diagnostics, luIntent) : [];

  return (
    <LuEditor
      height={225}
      luOption={{ fileId: luFile.id, sectionId: luIntent.Name, projectId }}
      value={luIntent.Body}
      onChange={commitChanges}
      diagnostics={diagnostics}
      editorSettings={userSettings.codeEditor}
      onChangeSettings={handleSettingsChange}
      placeholder={placeholder || inlineModePlaceholder}
    />
  );
};

export { LuisIntentEditor };
