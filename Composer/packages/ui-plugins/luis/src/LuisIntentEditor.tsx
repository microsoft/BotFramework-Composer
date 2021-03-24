// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo, useCallback } from 'react';
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
      luFile?.intents.find((intent) => intent.Name === intentName) ||
      ({
        Name: intentName,
        Body: '',
      } as LuIntentSection)
    );
  }, [intentName]);

  const navigateToLuPage = useCallback(
    (luFileId: string, sectionId?: string) => {
      // eslint-disable-next-line security/detect-non-literal-regexp
      const pattern = new RegExp(`.${locale}`, 'g');
      const fileId = currentDialog.isFormDialog ? luFileId : luFileId.replace(pattern, '');
      const url = currentDialog.isFormDialog
        ? `/bot/${projectId}/language-understanding/${currentDialog.id}/item/${fileId}`
        : `/bot/${projectId}/language-understanding/${fileId}${sectionId ? `/edit?t=${sectionId}` : ''}`;
      shellApi.navigateTo(url);
    },
    [shellApi, projectId, locale]
  );

  if (!luFile || !intentName) {
    return null;
  }

  const commitChanges = (newValue) => {
    if (!intentName) {
      return;
    }

    const newIntent = { Name: intentName, Body: newValue };
    shellApi.debouncedUpdateLuIntent(luFile.id, intentName, newIntent)?.then(shellApi.commitChanges);
    onChange(intentName);
  };

  const handleSettingsChange = (settings: CodeEditorSettings) => {
    shellApi.updateUserSettings({ codeEditor: settings });
  };

  const diagnostics = luFile ? filterSectionDiagnostics(luFile, luIntent.Name) : [];

  return (
    <LuEditor
      diagnostics={diagnostics}
      editorSettings={userSettings.codeEditor}
      height={225}
      luFile={luFile}
      luOption={{ fileId: luFile.id, sectionId: luIntent.Name, projectId, luFeatures }}
      placeholder={placeholder || inlineModePlaceholder}
      value={luIntent.Body}
      onChange={commitChanges}
      onChangeSettings={handleSettingsChange}
      onNavigateToLuPage={navigateToLuPage}
    />
  );
};

export { LuisIntentEditor };
