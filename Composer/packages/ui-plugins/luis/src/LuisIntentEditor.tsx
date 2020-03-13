// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { LuEditor } from '@bfc/code-editor';
import { FieldProps, useShellApi } from '@bfc/extension';
import { filterSectionDiagnostics } from '@bfc/indexers';
import { LuIntentSection } from '@bfc/shared';

const LuisIntentEditor: React.FC<FieldProps<string>> = props => {
  const { onChange, value: intentName } = props;
  const { currentDialog, luFiles, shellApi } = useShellApi();
  const luFile = luFiles.find(f => f.id === currentDialog.id);
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
    const newIntent = { Name: intentName, Body: newValue };
    setLuIntent(newIntent);
    shellApi.updateLuIntent(luFile.id, intentName, newIntent);
    onChange(intentName);
  };

  const diagnostic = luFile && filterSectionDiagnostics(luFile.diagnostics, luIntent)[0];

  const errorMsg = diagnostic
    ? diagnostic.message.split('error message: ')[diagnostic.message.split('error message: ').length - 1]
    : '';

  return (
    <LuEditor
      height={150}
      luOption={{ fileId: luFile.id, sectionId: luIntent.Name }}
      value={luIntent.Body}
      onChange={commitChanges}
      errorMessage={errorMsg}
      options={{
        lineNumbers: 'off',
        minimap: {
          enabled: false,
        },
        lineDecorationsWidth: 10,
        lineNumbersMinChars: 0,
        glyphMargin: false,
        folding: false,
        renderLineHighlight: 'none',
      }}
    />
  );
};

export { LuisIntentEditor };
