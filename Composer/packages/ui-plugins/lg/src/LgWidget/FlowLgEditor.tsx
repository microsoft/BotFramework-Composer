// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { LgEditor } from '@bfc/code-editor';
import { useShellApi } from '@bfc/extension-client';
import { filterTemplateDiagnostics } from '@bfc/indexers';
import { CodeEditorSettings, LgMetaData, LgTemplateRef } from '@bfc/shared';
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

const FlowLgEditor: React.FC<{ activityTemplate?: string; $kind: string; designerId: string }> = (props) => {
  const { activityTemplate, $kind, designerId } = props;
  const { currentDialog, lgFiles, shellApi, projectId, locale, userSettings } = useShellApi();

  const lgTemplateRef = LgTemplateRef.parse(activityTemplate);
  const lgName = new LgMetaData($kind, designerId || '').toString();

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

  const onChange = useCallback(
    (body: string) => {
      if (designerId) {
        if (body) {
          shellApi.debouncedUpdateLgTemplate(lgFileId, lgName, body).then(() => {
            if (lgTemplateRef) {
              shellApi.commitChanges();
            }
          });
        } else {
          shellApi.removeLgTemplate(lgFileId, lgName);
        }
      }
    },
    [designerId, shellApi, lgFileId, lgName, lgTemplateRef]
  );

  const handleSettingsChange = (settings: CodeEditorSettings) => {
    shellApi.updateUserSettings({ codeEditor: settings });
  };

  const navigateToLgPage = useCallback(
    (lgFileId: string, options?: { templateId?: string; line?: number }) => {
      // eslint-disable-next-line security/detect-non-literal-regexp
      const pattern = new RegExp(`.${locale}`, 'g');
      const fileId = currentDialog.isFormDialog ? lgFileId : lgFileId.replace(pattern, '');
      let url = currentDialog.isFormDialog
        ? `/bot/${projectId}/language-generation/${currentDialog.id}/item/${fileId}`
        : `/bot/${projectId}/language-generation/${fileId}`;

      if (options?.line) {
        url = url + `/edit#L=${options.line}`;
      } else if (options?.templateId) {
        url = url + `/edit?t=${options.templateId}`;
      }

      shellApi.navigateTo(url);
    },
    [shellApi, projectId, locale]
  );

  const onTemplateChange = useCallback(
    async (templateId: string, body?: string) => {
      if (body) {
        await shellApi.debouncedUpdateLgTemplate(lgFileId, templateId, body);
      } else {
        await shellApi.removeLgTemplate(lgFileId, templateId);
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
        showDirectTemplateLink
        diagnostics={diagnostics}
        editorSettings={userSettings.codeEditor}
        height={75}
        languageServer={{
          path: lspServerPath,
        }}
        lgOption={lgOption}
        lgTemplates={availableLgTemplates}
        memoryVariables={memoryVariables}
        mode="codeEditor"
        telemetryClient={shellApi.telemetryClient}
        value={template.body}
        onChange={onChange}
        onChangeSettings={handleSettingsChange}
        onNavigateToLgPage={navigateToLgPage}
        onRemoveTemplate={onRemoveTemplate}
        onTemplateChange={onTemplateChange}
      />
    </React.Fragment>
  );
};

export { FlowLgEditor };
