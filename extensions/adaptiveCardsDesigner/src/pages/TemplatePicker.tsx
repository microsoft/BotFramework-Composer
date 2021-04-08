// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';
import React, { useCallback, useMemo } from 'react';
import { Mode, ParsedLgTemplate } from './types';
import { LoadingSpinner } from '@bfc/ui-shared';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';

import { TemplateList } from './TemplateList';
import { AdaptiveCardRenderer } from './AdaptiveCardRenderer';
import { useLgTemplates } from './useLgTemplates';
import { getAdaptiveCard } from './utils';
import { cardTemples } from './templates';

const Container = styled.div({
  paddingTop: '8px',
});

type Props = {
  mode: Mode;
  selectedTemplate?: ParsedLgTemplate;
  onTemplateUpdated: (template: ParsedLgTemplate) => void;
};

export const TemplatePicker: React.FC<Props> = ({ mode, selectedTemplate, onTemplateUpdated }) => {
  const { status, lgTemplates } = useLgTemplates();

  const userLgTemplates = useMemo<ParsedLgTemplate[]>(() => {
    return lgTemplates.reduce((allTemplates, template) => {
      try {
        const body = getAdaptiveCard(template.body);
        return body?.type === 'AdaptiveCard' ? [...allTemplates, { ...template, body }] : allTemplates;
      } catch (error) {
        return allTemplates;
      }
    }, []);
  }, [lgTemplates]);

  const templates = useMemo(() => {
    return mode === 'create' ? cardTemples : userLgTemplates;
  }, [mode, userLgTemplates]);

  const onChange = useCallback(
    (_, name: string = '') => {
      onTemplateUpdated({ ...selectedTemplate, name });
    },
    [selectedTemplate, onTemplateUpdated]
  );

  return (
    <Container>
      <Stack horizontal horizontalAlign="space-between">
        <Stack>
          {mode === 'create' && (
            <React.Fragment>
              <Label required>{formatMessage('Template name')}</Label>
              <TextField onChange={onChange} />
            </React.Fragment>
          )}
          {status === 'loading' && mode === 'edit' ? (
            <LoadingSpinner />
          ) : (
            <TemplateList mode={mode} templates={templates} onTemplateSelected={onTemplateUpdated} />
          )}
        </Stack>
        <AdaptiveCardRenderer card={selectedTemplate?.body} />
      </Stack>
    </Container>
  );
};
