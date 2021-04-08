// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useCallback, useMemo, useState } from 'react';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { useApplicationApi, useLgApi, useProjectApi } from '@bfc/extension-client';
import formatMessage from 'format-message';

import { Mode } from './types';
import { TemplatePicker } from './TemplatePicker';
import { ParsedLgTemplate } from './types';
import { toCardJson } from './utils';

type Props = {
  hidden: boolean;
  onSelectTemplate: (template: ParsedLgTemplate) => void;
};

export const CreateTemplateModal: React.FC<Props> = ({ hidden, onSelectTemplate }) => {
  const { navigateTo } = useApplicationApi();
  const { addLgTemplate } = useLgApi();
  const { projectId } = useProjectApi();
  const [mode, setMode] = useState<Mode>('create');
  const [selectedTemplate, setSelectedTemplate] = useState<ParsedLgTemplate | undefined>();

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

  const onClick = useCallback(() => {
    if (mode === 'create') {
      addLgTemplate('common', selectedTemplate.name, toCardJson(selectedTemplate.body));
    }

    onSelectTemplate(selectedTemplate);
    navigateTo(
      `/bot/${projectId}/plugin/composer-adaptive-card-designer/adaptive-cards-designer?templateName=${selectedTemplate.name}`
    );
  }, [mode, projectId, selectedTemplate, navigateTo, addLgTemplate, onSelectTemplate]);

  return (
    !hidden && (
      <DialogWrapper
        isOpen
        dialogType={DialogTypes.DesignFlow}
        subText={formatMessage("Card will be written to the root bot's common templates")}
        minWidth={850}
        title={formatMessage('Create a new LG Template or edit an existing LG Template')}
      >
        <ChoiceGroup options={choices} defaultSelectedKey={mode} onChange={onSelectChoice} />
        <TemplatePicker mode={mode} selectedTemplate={selectedTemplate} onTemplateUpdated={onTemplateUpdated} />

        <DialogFooter>
          <PrimaryButton
            disabled={!selectedTemplate?.name || !selectedTemplate.body}
            text={mode === 'create' ? formatMessage('Create') : formatMessage('Edit')}
            onClick={onClick}
          />
        </DialogFooter>
      </DialogWrapper>
    )
  );
};
