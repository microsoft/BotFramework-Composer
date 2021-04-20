// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';
import React from 'react';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField, ITextFieldStyles } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';

import { AdaptiveCardRenderer } from './AdaptiveCardRenderer';
import { CardTemplate } from './types';
import { TemplateList } from './TemplateList';
import { templates } from './templates';
import { toJsonTemplate } from './utils';

const Container = styled(Stack)({
  padding: '8px 0',
});

const styles: { textField: Partial<ITextFieldStyles> } = {
  textField: {
    root: {
      width: '300px',
      padding: '0 4px',
    },
  },
};

type Props = {
  onDismiss: () => void;
  onComplete: (cardTemplate: CardTemplate<string>) => void;
};

export const CardCreationModal: React.FC<Props> = ({ onDismiss: onCancel, onComplete: onConfirm }) => {
  const [name, setName] = React.useState('');
  const [selectedTemplate, setSelectedTemplate] = React.useState<CardTemplate>(templates[1]);

  const onNameChange = React.useCallback((_, value?: string) => {
    setName(value || '');
  }, []);

  const onCreate = React.useCallback(() => {
    if (selectedTemplate) {
      const cardTemplate = { ...selectedTemplate, body: toJsonTemplate(selectedTemplate.body) };

      if (name) {
        cardTemplate.name = name;
      }

      onConfirm(cardTemplate);
    }
  }, [selectedTemplate, onConfirm]);

  const onDismiss = React.useCallback(() => {
    onCancel();
  }, []);

  const onTemplateSelected = React.useCallback((template: CardTemplate) => {
    setSelectedTemplate(template);
  }, []);

  return (
    <DialogWrapper
      isOpen
      dialogType={DialogTypes.DesignFlow}
      minWidth={800}
      title={formatMessage('Create a new adaptive card')}
      onDismiss={onDismiss}
    >
      <Container>
        <Link rel="noopener noreferrer" target="_blank">
          {formatMessage('Learn more about Adaptive Cards')}
        </Link>
      </Container>
      <Container horizontal>
        <Label>{formatMessage('LG template name for this card')}</Label>
        <TextField underlined styles={styles.textField} value={name} onChange={onNameChange} />
      </Container>
      <Container horizontal horizontalAlign="space-between">
        <TemplateList
          selectedTemplate={selectedTemplate}
          templates={templates}
          onTemplateSelected={onTemplateSelected}
        />
        <AdaptiveCardRenderer template={selectedTemplate} />
      </Container>
      <DialogFooter>
        <PrimaryButton disabled={!selectedTemplate} text={formatMessage('Create')} onClick={onCreate} />
        <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
      </DialogFooter>
    </DialogWrapper>
  );
};
