// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useCallback, useMemo, useState } from 'react';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { LgFile, useApplicationApi, useLgApi, useProjectApi } from '@bfc/extension-client';
import formatMessage from 'format-message';

import { Mode } from './types';
import { TemplatePicker } from './TemplatePicker';
import { ParsedLgTemplate } from './types';
import { getAdaptiveCard, toCardJson } from './utils';
import { cardTemplates } from './templates';

type Props = {
  hidden: boolean;
  onSelectLgFile: (fileId: string) => void;
  onSelectTemplate: (template: ParsedLgTemplate) => void;
};

export const CreateTemplateModal: React.FC<Props> = ({ hidden, onSelectTemplate, onSelectLgFile }) => {
  const { navigateTo } = useApplicationApi();
  const { lgFiles, projectId } = useProjectApi();
  const { addLgTemplate } = useLgApi();
  const [mode, setMode] = useState<Mode>('create');

  const filteredLgFiles = useMemo<LgFile[]>(() => {
    return lgFiles
      .map((lgFile) => {
        const templates = lgFile.templates.reduce((allTemplates, template) => {
          try {
            const body = getAdaptiveCard(template.body);
            return body?.type === 'AdaptiveCard' ? [...allTemplates, { ...template, body }] : allTemplates;
          } catch (error) {
            return allTemplates;
          }
        }, []);
        return { ...lgFile, templates };
      })
      .filter(({ templates }) => templates.length);
  }, [lgFiles]);

  const [selectedLgFile, setSelectedLgFile] = useState<LgFile | undefined>(filteredLgFiles?.[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<ParsedLgTemplate | undefined>();
  const [templateName, setTemplateName] = useState('');

  const templates = useMemo(() => {
    return mode === 'create' ? cardTemplates : selectedLgFile?.templates;
  }, [mode, selectedLgFile]);

  const choices = useMemo<IChoiceGroupOption[]>(
    () => [
      {
        key: 'create',
        text: formatMessage('Create a new Adaptive Card from a template'),
      },
      {
        key: 'edit',
        text: formatMessage('Edit an existing template'),
        disabled: !filteredLgFiles.some(({ templates }) => templates.length),
      },
    ],
    [filteredLgFiles]
  );

  const onSelectChoice = useCallback((_, option?: IChoiceGroupOption) => {
    if (option) {
      setMode(option.key as Mode);
      setSelectedTemplate(undefined);
    }
  }, []);

  const onTemplateUpdated = useCallback((template: ParsedLgTemplate) => {
    setSelectedTemplate(template);
  }, []);

  const onLgFileChanged = useCallback(
    (lgFile: LgFile) => {
      onSelectLgFile(lgFile.id);
      setSelectedLgFile(lgFile);
      if (mode === 'edit') {
        setSelectedTemplate(undefined);
      }
    },
    [mode, onSelectLgFile]
  );

  const onClick = useCallback(() => {
    if (mode === 'create' && selectedLgFile?.id) {
      selectedTemplate.name = templateName;
      addLgTemplate(selectedLgFile.id, templateName, toCardJson(selectedTemplate.body));
    }

    onSelectLgFile(selectedLgFile?.id);
    onSelectTemplate(selectedTemplate);
    navigateTo(
      `/bot/${projectId}/plugin/composer-adaptive-card-designer/adaptive-cards-designer?templateName=${selectedTemplate.name}&lgFileId=${selectedLgFile.id}`
    );
  }, [
    mode,
    projectId,
    selectedLgFile,
    selectedTemplate,
    templateName,
    navigateTo,
    addLgTemplate,
    onSelectTemplate,
    onSelectLgFile,
  ]);

  return (
    !hidden && (
      <DialogWrapper
        isOpen
        dialogType={DialogTypes.DesignFlow}
        minWidth={850}
        subText={formatMessage("Card will be written to the root bot's common templates")}
        title={formatMessage('Create a new LG Template or edit an existing LG Template')}
      >
        <ChoiceGroup defaultSelectedKey={mode} options={choices} onChange={onSelectChoice} />
        <TemplatePicker
          lgFiles={mode === 'create' ? lgFiles : filteredLgFiles}
          mode={mode}
          selectedLgFileId={selectedLgFile?.id}
          selectedTemplate={selectedTemplate}
          templateName={templateName}
          templates={templates as ParsedLgTemplate[]}
          onLgFileChanged={onLgFileChanged}
          onTemplateNameChanged={setTemplateName}
          onTemplateUpdated={onTemplateUpdated}
        />
        <DialogFooter>
          <PrimaryButton
            disabled={!(selectedTemplate?.name || templateName) || !selectedTemplate?.body || !selectedLgFile}
            text={mode === 'create' ? formatMessage('Create') : formatMessage('Edit')}
            onClick={onClick}
          />
        </DialogFooter>
      </DialogWrapper>
    )
  );
};
