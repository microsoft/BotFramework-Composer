// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo } from 'react';
import { FieldProps, useShellApi, useRecognizerConfig } from '@bfc/extension-client';
import { MicrosoftIRecognizer } from '@bfc/shared';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';

import { FieldLabel } from '../../FieldLabel';

import { useMigrationEffect } from './useMigrationEffect';
import { getRecognizerDefinition as findRecognizerDefinition } from './findRecognizerDefinition';
import { getDropdownOptions } from './getDropdownOptions';

export const RecognizerField: React.FC<FieldProps<MicrosoftIRecognizer>> = (props) => {
  const { value, id, label, description, uiOptions, required, onChange } = props;
  const { shellApi, ...shellData } = useShellApi();

  useMigrationEffect(value, onChange);
  const recognizerConfigs = useRecognizerConfig();
  const dropdownOptions = useMemo(() => getDropdownOptions(recognizerConfigs), [recognizerConfigs]);

  const currentRecognizerDef = findRecognizerDefinition(value, recognizerConfigs);
  const RecognizerEditor = currentRecognizerDef?.recognizerEditor;
  const widget = RecognizerEditor ? <RecognizerEditor {...props} /> : null;

  const handleChangeRecognizerType = (_, option?: IDropdownOption): void => {
    if (!option) return;
    const submitChange = recognizerConfigs.find((r) => r.id === option.key)?.handleRecognizerChange;
    submitChange && submitChange(props, shellData, shellApi);
  };

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      <Dropdown
        data-testid="recognizerTypeDropdown"
        label={formatMessage('Recognizer Type')}
        options={dropdownOptions}
        responsiveMode={ResponsiveMode.large}
        selectedKey={currentRecognizerDef?.id}
        onChange={handleChangeRecognizerType}
      />
      {widget}
    </React.Fragment>
  );
};
