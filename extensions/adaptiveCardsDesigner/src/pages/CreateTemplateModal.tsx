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
  const [selectedLgFile, setSelectedLgFile] = useState<LgFile | undefined>(lgFiles?.[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<ParsedLgTemplate | undefined>();

  const userLgTemplates = useMemo<ParsedLgTemplate[]>(() => {
    return selectedLgFile?.templates.reduce((allTemplates, template) => {
      try {
        const body = getAdaptiveCard(template.body);
        return body?.type === 'AdaptiveCard' ? [...allTemplates, { ...template, body }] : allTemplates;
      } catch (error) {
        return allTemplates;
      }
    }, []);
  }, [selectedLgFile.allTemplates]);

  const templates = useMemo(() => {
    return mode === 'create' ? cardTemplates : userLgTemplates;
  }, [mode, userLgTemplates]);

  const choices = useMemo<IChoiceGroupOption[]>(
    () => [
      {
        key: 'create',
        text: formatMessage('Create a new Adaptive Card from a template'),
      },
      {
        key: 'edit',
        text: formatMessage('Edit an existing template'),
      },
    ],
    []
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
      addLgTemplate(selectedLgFile.id, selectedTemplate.name, toCardJson(selectedTemplate.body));
    }

    onSelectLgFile(selectedLgFile?.id);
    onSelectTemplate(selectedTemplate);
    navigateTo(
      `/bot/${projectId}/plugin/composer-adaptive-card-designer/adaptive-cards-designer?templateName=${selectedTemplate.name}&lgFileId=${selectedLgFile.id}`
    );
  }, [mode, projectId, selectedLgFile, selectedTemplate, navigateTo, addLgTemplate, onSelectTemplate, onSelectLgFile]);

  return (
    !hidden && (
      <DialogWrapper
        isOpen
        dialogType={DialogTypes.DesignFlow}
        subText={formatMessage("Card will be written to the root bot's common templates")}
        minWidth={850}
        title={formatMessage('Create a new LG Template or edit an existing LG Template')}
      >
        <ChoiceGroup defaultSelectedKey={mode} options={choices} onChange={onSelectChoice} />
        <TemplatePicker
          lgFiles={lgFiles}
          mode={mode}
          selectedLgFileId={selectedLgFile?.id}
          selectedTemplate={selectedTemplate}
          templates={templates}
          onLgFileChanged={onLgFileChanged}
          onTemplateUpdated={onTemplateUpdated}
        />
        <DialogFooter>
          <PrimaryButton
            disabled={!selectedTemplate?.name || !selectedTemplate?.body || !selectedLgFile}
            text={mode === 'create' ? formatMessage('Create') : formatMessage('Edit')}
            onClick={onClick}
          />
        </DialogFooter>
      </DialogWrapper>
    )
  );
};
