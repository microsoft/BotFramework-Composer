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
    /**
     * if intent is referenced from imported files, use origin intent.
     * because update on origin file won't reparse current file, so the `allIntent` may out of date.
     */
    const intentInCurrentFile = luFile?.allIntents.find((intent) => intent.Name === intentName);
    if (intentInCurrentFile) {
      if (intentInCurrentFile.fileId === luFile?.id) {
        return intentInCurrentFile;
      } else {
        const intentInOriginFile = luFiles
          .find(({ id }) => id === intentInCurrentFile.fileId)
          ?.intents?.find((intent) => intent.Name === intentName);
        if (intentInOriginFile) return intentInOriginFile;
      }
    }
    return {
      Name: intentName,
      Body: '',
    } as LuIntentSection;
  }, [intentName, luFiles]);

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
    [shellApi, projectId, locale, currentDialog]
  );

  if (!luFile || !intentName) {
    return null;
  }

  const commitChanges = (newValue) => {
    if (!intentName) {
      return;
    }

    const newIntent = { Name: intentName, Body: newValue };
    shellApi
      .debouncedUpdateLuIntent(luIntent?.fileId ?? luFile.id, intentName, newIntent)
      ?.then(shellApi.commitChanges);
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
      telemetryClient={shellApi.telemetryClient}
      value={luIntent.Body}
      onChange={commitChanges}
      onChangeSettings={handleSettingsChange}
      onNavigateToLuPage={navigateToLuPage}
    />
  );
};

export { LuisIntentEditor };
