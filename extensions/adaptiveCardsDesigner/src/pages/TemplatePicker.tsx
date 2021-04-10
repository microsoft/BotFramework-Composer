// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';
import React, { useCallback, useMemo } from 'react';
import { Mode, ParsedLgTemplate } from './types';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';

import { TemplateList } from './TemplateList';
import { AdaptiveCardRenderer } from './AdaptiveCardRenderer';
import { LgFile } from '@botframework-composer/types';

const Container = styled.div({
  paddingTop: '8px',
});

type Props = {
  lgFiles: LgFile[];
  templates: ParsedLgTemplate[];
  mode: Mode;
  selectedLgFileId: string;
  selectedTemplate?: ParsedLgTemplate;
  onLgFileChanged: (file: LgFile) => void;
  onTemplateUpdated: (template: ParsedLgTemplate) => void;
};

export const TemplatePicker: React.FC<Props> = ({
  lgFiles,
  templates,
  mode,
  selectedLgFileId,
  selectedTemplate,
  onLgFileChanged,
  onTemplateUpdated,
}) => {
  const lgFileOptions = useMemo(() => {
    return lgFiles.map((file) => ({
      key: file.id,
      text: file.id,
      data: {
        file,
      },
    }));
  }, [lgFiles]);

  const onDropdownChange = useCallback(
    (_, option?: IDropdownOption) => {
      if (option.key) {
        onLgFileChanged(option.data.file);
      }
    },
    [onLgFileChanged]
  );

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
          <Label required>{formatMessage('Lg file')}</Label>
          <Dropdown options={lgFileOptions} defaultSelectedKey={selectedLgFileId} onChange={onDropdownChange} />
          {mode === 'create' && (
            <React.Fragment>
              <Label required>{formatMessage('Template name')}</Label>
              <TextField onChange={onChange} />
            </React.Fragment>
          )}
          <TemplateList mode={mode} templates={templates} onTemplateSelected={onTemplateUpdated} />
        </Stack>
        <AdaptiveCardRenderer card={selectedTemplate?.body} />
      </Stack>
    </Container>
  );
};
