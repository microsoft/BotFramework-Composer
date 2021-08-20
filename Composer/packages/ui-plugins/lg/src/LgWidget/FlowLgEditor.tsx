// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { LgEditor } from '@bfc/code-editor';
import { useShellApi } from '@bfc/extension-client';
import { filterTemplateDiagnostics } from '@bfc/indexers';
import { CodeEditorSettings, LgMetaData, LgTemplateRef, LgType } from '@bfc/shared';
import { jsx } from '@emotion/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { locateLgTemplatePosition } from '../locateLgTemplatePosition';

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

const FlowLgEditor: React.FC<{
  activityTemplate?: string;
  $kind: string;
  designerId: string;
  name: string;
  onChange: (templateId?: string) => void;
}> = ({ activityTemplate, $kind, designerId, onChange, name }) => {
  const { currentDialog, lgFiles, shellApi, projectId, locale, userSettings } = useShellApi();

  const lgType = new LgType($kind, name).toString();
  const lgTemplateRef = LgTemplateRef.parse(activityTemplate);
  const lgName = new LgMetaData(lgType, designerId || '').toString();

  const relatedLgFile = locateLgTemplatePosition(lgFiles, lgName, locale);

  const fallbackLgFileId = `${currentDialog.lgFile}.${locale}`;
  const lgFile = relatedLgFile ?? lgFiles.find((f) => f.id === fallbackLgFileId);
  const lgFileId = lgFile?.id ?? fallbackLgFileId;

  const [memoryVariables, setMemoryVariables] = useState<string[] | undefined>();

  useEffect(() => {
    const abortController = new AbortController();
    (async () => {
      try {
        const variables = await shellApi.getMemoryVariables(projectId, { signal: abortController.signal });
        setMemoryVariables(variables);
      } catch (e) {
        // error can be due to abort
      }
    })();

    // clean up pending async request
    return () => {
      abortController.abort();
    };
  }, [projectId]);

  const availableLgTemplates = useMemo(
    () =>
      (lgFiles.find((lgFile) => lgFile.id === lgFileId)?.allTemplates || [])
        .filter((t) => t.name !== lgTemplateRef?.name)
        .sort(),
    [lgFileId, lgFiles]
  );

  const template = lgFile?.templates?.find((template) => {
    return template.name === lgName;
  }) || {
    name: lgName,
    parameters: [],
    body: getInitialTemplate(name, activityTemplate),
  };

  const diagnostics = lgFile ? filterTemplateDiagnostics(lgFile, template.name) : [];

  const lgOption = {
    projectId,
    fileId: lgFileId,
    templateId: lgName,
    template,
  };

  const handleChange = useCallback(
    (body: string) => {
      if (designerId) {
        if (body) {
          shellApi.debouncedUpdateLgTemplate(lgFileId, lgName, body).then(() => {
            if (lgTemplateRef) {
              shellApi.commitChanges();
            }
          });
          onChange(new LgTemplateRef(lgName).toString());
        } else {
          shellApi.removeLgTemplate(lgFileId, lgName).then(() => {
            onChange();
          });
        }
      }
    },
    [designerId, shellApi, lgFileId, lgName, lgTemplateRef]
  );

  const handleSettingsChange = (settings: CodeEditorSettings) => {
    shellApi.updateUserSettings({ codeEditor: settings });
  };

  const onTemplateChange = useCallback(
    async (templateId: string, body?: string) => {
      if (body) {
        await shellApi.debouncedUpdateLgTemplate(lgFileId, templateId, body);
        if (templateId === lgOption.templateId) {
          onChange(new LgTemplateRef(templateId).toString());
        }
      } else {
        await shellApi.removeLgTemplate(lgFileId, templateId);
        if (templateId === lgOption.templateId) {
          onChange();
        }
      }
    },
    [lgOption, shellApi]
  );

  const onRemoveTemplate = useCallback(
    (template: string) => {
      onTemplateChange(template);
    },
    [onTemplateChange]
  );

  return (
    <React.Fragment>
      <LgEditor
        hidePlaceholder
        startWithEmptyResponse
        diagnostics={diagnostics}
        editorSettings={userSettings.codeEditor}
        height={75}
        languageServer={{
          path: lspServerPath,
        }}
        lgOption={lgOption}
        lgTemplates={availableLgTemplates}
        memoryVariables={memoryVariables}
        mode="responseEditor"
        telemetryClient={shellApi.telemetryClient}
        value={template.body}
        onChange={handleChange}
        onChangeSettings={handleSettingsChange}
        onRemoveTemplate={onRemoveTemplate}
        onTemplateChange={onTemplateChange}
      />
    </React.Fragment>
  );
};

export { FlowLgEditor };
