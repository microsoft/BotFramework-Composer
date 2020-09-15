// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo, useState } from 'react';
import { FieldProps, useShellApi, useRecognizerConfig, RecognizerSchema } from '@bfc/extension-client';
import { MicrosoftIRecognizer, SDKKinds } from '@bfc/shared';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';
import { JsonEditor } from '@bfc/code-editor';

import { FieldLabel } from '../../FieldLabel';

import { useMigrationEffect } from './useMigrationEffect';

export const RecognizerField: React.FC<FieldProps<MicrosoftIRecognizer>> = (props) => {
  const { value, id, label, description, uiOptions, required, onChange } = props;
  const { shellApi, ...shellData } = useShellApi();
  const recognizerConfigs = useRecognizerConfig();
  const [dropdownOption, setDropdownOption] = useState(getSelectedType(value, recognizerConfigs));

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
    setDropdownOption(option?.key as string);

    const handleRecognizerChange = recognizerConfigs.find((r) => r.id === option?.key)?.handleRecognizerChange;
    handleRecognizerChange && handleRecognizerChange(props, shellData, shellApi);
  };

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      <Dropdown
        data-testid="recognizerTypeDropdown"
        label={formatMessage('Recognizer Type')}
        options={options}
        responsiveMode={ResponsiveMode.large}
        selectedKey={dropdownOption}
        onChange={handleChangeRecognizerType}
      />
      {dropdownOption === SDKKinds.CustomRecognizer && (
        <JsonEditor
          key={'customRecognizer'}
          height={200}
          id={'customRecog'}
          value={value as object}
          onChange={onChange}
        />
      )}
    </React.Fragment>
  );
};

const getSelectedType = (
  value: MicrosoftIRecognizer | undefined,
  recognizers: RecognizerSchema[]
): string | undefined => {
  const selected =
    value === undefined
      ? recognizers.length > 0
        ? [recognizers[0].id]
        : []
      : recognizers.filter((r) => r.isSelected(value)).map((r) => r.id);

  const involvedCustomItem = selected.find((item) => item !== SDKKinds.CustomRecognizer);
  if (involvedCustomItem) {
    return involvedCustomItem;
  }
  if (selected.length < 1) {
    /* istanbul ignore next */
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `Unable to determine selected recognizer.\n
         Value: ${JSON.stringify(value)}.\n
         Selected Recognizers: [${selected.join(', ')}]`
      );
    }
    return;
  }

  // transform luis recognizer to crosss trained recognizer for old bot.
  if (selected[0] === SDKKinds.LuisRecognizer) {
    selected[0] = SDKKinds.CrossTrainedRecognizerSet;
  }
  return selected[0];
};
