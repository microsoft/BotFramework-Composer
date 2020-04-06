// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { LuEditor } from '@bfc/code-editor';
import { FieldProps, useShellApi } from '@bfc/extension';
import { filterSectionDiagnostics } from '@bfc/indexers';
import { LuIntentSection } from '@bfc/shared';

const LuisIntentEditor: React.FC<FieldProps<string>> = props => {
  const { onChange, value, schema } = props;
  const { currentDialog, designerId, luFiles, shellApi, locale, projectId, codeEditorSettings } = useShellApi();
  const luFile = luFiles.find(f => f.id === `${currentDialog.id}.${locale}`);

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

  const commitChanges = newValue => {
    if (!intentName) {
      return;
    }

    const newIntent = { Name: intentName, Body: newValue };
    setLuIntent(newIntent);
    shellApi.updateLuIntent(luFile.id, intentName, newIntent);
    onChange(intentName);
  };

  const diagnostics = luFile ? filterSectionDiagnostics(luFile.diagnostics, luIntent) : [];

  return (
    <LuEditor
      height={150}
      luOption={{ fileId: luFile.id, sectionId: luIntent.Name, projectId }}
      value={luIntent.Body}
      onChange={commitChanges}
      diagnostics={diagnostics}
      editorSettings={codeEditorSettings}
      onChangeSettings={shellApi.updateCodeEditorSettings}
    />
  );
};

export { LuisIntentEditor };
