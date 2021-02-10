// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { FieldLabel, useFormData } from '@bfc/adaptive-form';
import { LgEditor, LgEditorMode } from '@bfc/code-editor';
import { FieldProps, useShellApi } from '@bfc/extension-client';
import { filterTemplateDiagnostics } from '@bfc/indexers';
import { CodeEditorSettings, LgMetaData, LgTemplateRef, LgType } from '@bfc/shared';
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import React, { useCallback } from 'react';

import { locateLgTemplatePosition } from './locateLgTemplatePosition';

const linkStyles = {
  root: { fontSize: 12, ':hover': { textDecoration: 'none' }, ':active': { textDecoration: 'none' } },
};

const lspServerPath = '/lg-language-server';

const tryGetLgMetaDataType = (lgText: string): string | null => {
  const lgRef = LgTemplateRef.parse(lgText);
  if (lgRef === null) return null;

  const lgMetaData = LgMetaData.parse(lgRef.name);
  if (lgMetaData === null) return null;

  return lgMetaData.type;
};

const getInitialTemplate = (fieldName: string, formData?: string): string => {
  const lgText = formData || '';

  // Field content is already a ref created by composer.
  if (tryGetLgMetaDataType(lgText) === fieldName) {
    return '';
  }
  return lgText.startsWith('-') ? lgText : `- ${lgText}`;
};

const LgField: React.FC<FieldProps<string>> = (props) => {
  const { label, id, description, value, name, uiOptions, required } = props;
  const { designerId, currentDialog, lgFiles, shellApi, projectId, locale, userSettings } = useShellApi();
  const formData = useFormData();

  const [editorMode, setEditorMode] = React.useState<LgEditorMode>('codeEditor');

  let lgType = name;
  const $kind = formData?.$kind;
  if ($kind) {
    lgType = new LgType($kind, name).toString();
  }

  const lgTemplateRef = LgTemplateRef.parse(value);
  const lgName = lgTemplateRef ? lgTemplateRef.name : new LgMetaData(lgType, designerId || '').toString();

  const relatedLgFile = locateLgTemplatePosition(lgFiles, lgName, locale);

  const fallbackLgFileId = `${currentDialog.lgFile}.${locale}`;
  const lgFile = relatedLgFile ?? lgFiles.find((f) => f.id === fallbackLgFileId);
  const lgFileId = lgFile?.id ?? fallbackLgFileId;

  const availableLgTemplates = React.useMemo(
    () =>
      (lgFiles.find((lgFile) => lgFile.id === lgFileId)?.allTemplates || [])
        .filter((t) => t.name !== lgTemplateRef?.name)
        .sort(),
    [lgFileId, lgFiles]
  );

  const updateLgTemplate = useCallback(
    async (body: string) => {
      await shellApi.debouncedUpdateLgTemplate(lgFileId, lgName, body);
    },
    [lgName, lgFileId]
  );

  const template = lgFile?.templates?.find((template) => {
    return template.name === lgName;
  }) || {
    name: lgName,
    parameters: [],
    body: getInitialTemplate(name, value),
  };

  const diagnostics = lgFile ? filterTemplateDiagnostics(lgFile, template.name) : [];

  const lgOption = {
    projectId,
    fileId: lgFileId,
    templateId: lgName,
  };

  const onChange = (body: string) => {
    if (designerId) {
      if (body) {
        updateLgTemplate(body).then(() => {
          if (lgTemplateRef) {
            shellApi.commitChanges();
          }
        });
        props.onChange(new LgTemplateRef(lgName).toString());
      } else {
        shellApi.removeLgTemplate(lgFileId, lgName).then(() => {
          props.onChange();
        });
      }
    }
  };

  const handleSettingsChange = (settings: Partial<CodeEditorSettings>) => {
    shellApi.updateUserSettings({ codeEditor: settings });
  };

  const modeChange = React.useCallback(() => {
    setEditorMode(editorMode === 'codeEditor' ? 'responseEditor' : 'codeEditor');
  }, [editorMode]);

  const navigateToLgPage = React.useCallback(
    (lgFileId: string) => {
      shellApi.navigateTo(`/bot/${projectId}/language-generation/${lgFileId}`);
    },
    [shellApi, projectId]
  );

  return (
    <React.Fragment>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <FieldLabel
          description={description}
          helpLink={uiOptions?.helpLink}
          id={id}
          label={label}
          required={required}
        />
        <Link as="button" styles={linkStyles} onClick={modeChange}>
          {editorMode === 'codeEditor'
            ? formatMessage('switch to response editor')
            : formatMessage('switch to code editor')}
        </Link>
      </Stack>
      <LgEditor
        hidePlaceholder
        diagnostics={diagnostics}
        editorSettings={userSettings.codeEditor}
        height={225}
        languageServer={{
          path: lspServerPath,
        }}
        lgOption={lgOption}
        lgTemplates={availableLgTemplates}
        mode={editorMode}
        value={template.body}
        onChange={onChange}
        onChangeSettings={handleSettingsChange}
        onNavigateToLgPage={navigateToLgPage}
      />
    </React.Fragment>
  );
};

export { LgField };
