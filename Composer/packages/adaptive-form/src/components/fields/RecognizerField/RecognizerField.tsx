// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo } from 'react';
import { FieldProps, useShellApi, useRecognizerConfig } from '@bfc/extension-client';
import { MicrosoftIRecognizer, SDKKinds } from '@bfc/shared';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';

import { FieldLabel } from '../../FieldLabel';

import { useMigrationEffect } from './useMigrationEffect';
import { getRecognizerDefinition } from './getRecognizerDefinition';

export const RecognizerField: React.FC<FieldProps<MicrosoftIRecognizer>> = (props) => {
  const { value, id, label, description, uiOptions, required, onChange } = props;
  const { shellApi, ...shellData } = useShellApi();
  const recognizerConfigs = useRecognizerConfig();
  const currentRecognizerDef = getRecognizerDefinition(value, recognizerConfigs);

  useMigrationEffect(value, onChange);

  const options = useMemo(() => {
    // filter luisRecognizer for dropdown options
    return recognizerConfigs
      .filter((r) => r.id !== SDKKinds.LuisRecognizer)
      .map((r) => ({
        key: r.id,
        text: typeof r.displayName === 'function' ? r.displayName(value) : r.displayName,
      }));
  }, [recognizerConfigs]);

  const handleChangeRecognizerType = (_, option?: IDropdownOption): void => {
    const handleRecognizerChange = recognizerConfigs.find((r) => r.id === option?.key)?.handleRecognizerChange;
    handleRecognizerChange && handleRecognizerChange(props, shellData, shellApi);
  };

  const RecognizerEditor = currentRecognizerDef?.recognizerEditor;
  const widget = RecognizerEditor ? <RecognizerEditor {...props} /> : null;

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      <Dropdown
        data-testid="recognizerTypeDropdown"
        label={formatMessage('Recognizer Type')}
        options={options}
        responsiveMode={ResponsiveMode.large}
        selectedKey={currentRecognizerDef?.id}
        onChange={handleChangeRecognizerType}
      />
      {widget}
    </React.Fragment>
  );
};
