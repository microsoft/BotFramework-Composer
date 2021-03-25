// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { FieldLabel, useFormData } from '@bfc/adaptive-form';
import { LgEditor, LgEditorMode, validateStructuredResponse } from '@bfc/code-editor';
import { DiagnosticSeverity, FieldProps, useShellApi } from '@bfc/extension-client';
import { filterTemplateDiagnostics } from '@bfc/indexers';
import { CodeEditorSettings, LgMetaData, LgTemplateRef, LgType } from '@bfc/shared';
import { OpenConfirmModal } from '@bfc/ui-shared';
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { locateLgTemplatePosition } from './locateLgTemplatePosition';

const structuredResponseDocumentUrl =
  'https://docs.microsoft.com/en-us/azure/bot-service/language-generation/language-generation-structured-response-template?view=azure-bot-service-4.0';
const linkStyles = {
  root: {
    fontSize: 12,
    selectors: {
      '&:hover': { textDecoration: 'none' },
      '&:active': { textDecoration: 'none' },
    },
  },
};

const confirmDialogContentStyles = {
  root: { marginBottom: 16 },
};

const confirmDialogContentTokens = {
  childrenGap: 16,
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
    body: getInitialTemplate(name, value),
  };

  const diagnostics = lgFile ? filterTemplateDiagnostics(lgFile, template.name) : [];

  const responseEditorLinkDisabled = useMemo(() => diagnostics.some((d) => d.severity === DiagnosticSeverity.Error), [
    diagnostics,
  ]);

  const allowResponseEditor = useMemo(() => !responseEditorLinkDisabled && validateStructuredResponse(template), [
    template,
    responseEditorLinkDisabled,
  ]);

  const [editorMode, setEditorMode] = React.useState<LgEditorMode>(
    allowResponseEditor ? 'responseEditor' : 'codeEditor'
  );

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
          props.onChange(new LgTemplateRef(lgName).toString());
        } else {
          shellApi.removeLgTemplate(lgFileId, lgName).then(() => {
            props.onChange();
          });
        }
      }
    },
    [designerId, shellApi, lgFileId, lgName, lgTemplateRef, props.onChange]
  );

  const handleSettingsChange = (settings: CodeEditorSettings) => {
    shellApi.updateUserSettings({ codeEditor: settings });
  };

  const renderConfirmDialogContent = useCallback(
    (text: React.ReactNode) => (
      <Stack styles={confirmDialogContentStyles} tokens={confirmDialogContentTokens}>
        {text}
      </Stack>
    ),
    []
  );

  const modeChange = useCallback(async () => {
    if (editorMode === 'codeEditor' && !allowResponseEditor) {
      const confirm = await OpenConfirmModal(
        formatMessage('Warning'),
        <React.Fragment>
          {formatMessage.rich(
            '<text>To use Response editor, the LG template needs to be an activity response template. <a>Visit this document</a> to learn more.</text>',
            {
              a: ({ children }) => (
                <Link key="help_document_url" href={structuredResponseDocumentUrl} target="_blank">
                  {children}
                </Link>
              ),
              text: ({ children }) => <Text key="confirm_message_0">{children}</Text>,
            }
          )}
          {formatMessage.rich(
            '<text>If you proceed to switch to Response editor, you will lose your current template content, and start with a blank response. Do you want to continue?</text>',
            {
              text: ({ children }) => <Text key="confirm_message_1">{children}</Text>,
            }
          )}
        </React.Fragment>,
        { confirmText: formatMessage('Confirm'), onRenderContent: renderConfirmDialogContent }
      );

      if (confirm) {
        await shellApi.debouncedUpdateLgTemplate(lgFileId, lgOption.templateId, '');
        shellApi.commitChanges();
        props.onChange(new LgTemplateRef(lgOption.templateId).toString());
        setEditorMode('responseEditor');
        shellApi.telemetryClient.track('LGEditorSwitchToResponseEditor');
      }
      return;
    }

    shellApi.telemetryClient.track(
      editorMode === 'codeEditor' ? 'LGEditorSwitchToCodeEditor' : 'LGEditorSwitchToResponseEditor'
    );
    setEditorMode(editorMode === 'codeEditor' ? 'responseEditor' : 'codeEditor');
  }, [editorMode, allowResponseEditor, props.onChange, shellApi.telemetryClient]);

  const navigateToLgPage = useCallback(
    (lgFileId: string, templateId?: string) => {
      // eslint-disable-next-line security/detect-non-literal-regexp
      const pattern = new RegExp(`.${locale}`, 'g');
      const fileId = currentDialog.isFormDialog ? lgFileId : lgFileId.replace(pattern, '');
      const url = currentDialog.isFormDialog
        ? `/bot/${projectId}/language-generation/${currentDialog.id}/item/${fileId}`
        : `/bot/${projectId}/language-generation/${fileId}${templateId ? `/edit?t=${templateId}` : ''}`;
      shellApi.navigateTo(url);
    },
    [shellApi, projectId, locale]
  );

  const onTemplateChange = useCallback(
    async (templateId: string, body?: string) => {
      if (body) {
        await shellApi.debouncedUpdateLgTemplate(lgFileId, templateId, body);
        if (templateId === lgOption.templateId) {
          props.onChange(new LgTemplateRef(templateId).toString());
        }
      } else {
        await shellApi.removeLgTemplate(lgFileId, templateId);
        if (templateId === lgOption.templateId) {
          props.onChange();
        }
      }
    },
    [lgOption, shellApi, props.onChange]
  );

  const onRemoveTemplate = useCallback(
    (template: string) => {
      onTemplateChange(template);
    },
    [onTemplateChange]
  );

  const popExpandOptions = React.useMemo(() => ({ popExpandTitle: label || formatMessage('Bot response') }), []);

  return (
    <React.Fragment>
      <Stack horizontal horizontalAlign="space-between" styles={{ root: { marginBottom: 4 } }} verticalAlign="center">
        <FieldLabel
          description={description}
          helpLink={uiOptions?.helpLink}
          id={id}
          label={label}
          required={required}
        />
        <TooltipHost
          content={
            responseEditorLinkDisabled && editorMode === 'codeEditor'
              ? formatMessage('In order to use the response editor, please fix your template errors first.')
              : undefined
          }
        >
          <Link
            as="button"
            disabled={editorMode === 'codeEditor' && responseEditorLinkDisabled}
            styles={linkStyles}
            onClick={modeChange}
          >
            {editorMode === 'codeEditor'
              ? formatMessage('Switch to response editor')
              : formatMessage('Switch to code editor')}
          </Link>
        </TooltipHost>
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
        memoryVariables={memoryVariables}
        mode={editorMode}
        popExpandOptions={popExpandOptions}
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

export { LgField };
