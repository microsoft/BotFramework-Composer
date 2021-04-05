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
import { mapDropdownOptionToRecognizerSchema } from './mappers';
import { getDropdownOptions } from './getDropdownOptions';

export const RecognizerField: React.FC<FieldProps<MicrosoftIRecognizer>> = (props) => {
  const { value, id, label, description, uiOptions, required, onChange } = props;
  const { shellApi, ...shellData } = useShellApi();

  useMigrationEffect(value, onChange);
  const { recognizers: recognizerConfigs, currentRecognizer } = useRecognizerConfig();
  const dropdownOptions = useMemo(() => getDropdownOptions(recognizerConfigs, shellData, shellApi), [
    recognizerConfigs,
  ]);

  const RecognizerEditor = currentRecognizer?.recognizerEditor;
  const widget = RecognizerEditor ? <RecognizerEditor {...props} /> : null;

  const submit = (_, option?: IDropdownOption): void => {
    if (!option) return;

    const recognizerDefinition = mapDropdownOptionToRecognizerSchema(option, recognizerConfigs);

    const seedNewRecognizer = recognizerDefinition?.seedNewRecognizer;
    const recognizerInstance =
      typeof seedNewRecognizer === 'function'
        ? seedNewRecognizer(shellData, shellApi)
        : { $kind: option.key as string, intents: [] }; // fallback to default Recognizer instance;
    onChange(recognizerInstance);
  };

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      <Dropdown
        ariaLabel={formatMessage('Recognizer Type')}
        data-testid="recognizerTypeDropdown"
        label={formatMessage('Recognizer Type')}
        options={dropdownOptions}
        responsiveMode={ResponsiveMode.large}
        selectedKey={currentRecognizer?.id}
        onChange={submit}
      />
      {widget}
    </React.Fragment>
  );
};
