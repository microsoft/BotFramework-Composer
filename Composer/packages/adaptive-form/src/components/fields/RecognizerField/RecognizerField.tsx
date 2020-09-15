// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo, useState } from 'react';
import { FieldProps, useShellApi, useRecognizerConfig } from '@bfc/extension-client';
import { MicrosoftIRecognizer, SDKKinds } from '@bfc/shared';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';
import { JsonEditor } from '@bfc/code-editor';

import { FieldLabel } from '../../FieldLabel';

import { useMigrationEffect } from './useMigrationEffect';

export const RecognizerField: React.FC<FieldProps<MicrosoftIRecognizer>> = (props) => {
  const { value, id, label, description, uiOptions, required, onChange } = props;
  const { shellApi, ...shellData } = useShellApi();
  const recognizers = useRecognizerConfig();
  const [isCustomType, setIsCustomType] = useState(false);

  useMigrationEffect(value, onChange);

  const options = useMemo(() => {
    // filter luisRecognizer for dropdown options
    return recognizers
      .filter((r) => r.id !== SDKKinds.LuisRecognizer)
      .map((r) => ({
        key: r.id,
        text: typeof r.displayName === 'function' ? r.displayName(value) : r.displayName,
      }));
  }, [recognizers]);

  const selectedType = useMemo(() => {
    if (isCustomType) {
      return SDKKinds.CustomRecognizer;
    }
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
  }, [value, isCustomType]);

  const handleChangeRecognizerType = (_, option?: IDropdownOption): void => {
    if (option) {
      if (option.key === SDKKinds.CustomRecognizer) {
        setIsCustomType(true);
        return;
      }

      setIsCustomType(false);
      const handler = recognizers.find((r) => r.id === option.key)?.handleRecognizerChange;

      if (handler) {
        handler(props, shellData, shellApi);
      }
    }
  };

  const handleCustomChange = (value: string): void => {
    setIsCustomType(true);
    onChange(value);
  };
  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      {selectedType ? (
        <Dropdown
          data-testid="recognizerTypeDropdown"
          label={formatMessage('Recognizer Type')}
          options={options}
          responsiveMode={ResponsiveMode.large}
          selectedKey={selectedType}
          onChange={handleChangeRecognizerType}
        />
      ) : (
        formatMessage('Unable to determine recognizer type from data: {value}', { value })
      )}
      {selectedType === SDKKinds.CustomRecognizer && (
        <JsonEditor
          key={'customRecognizer'}
          height={200}
          id={'customRecog'}
          value={value as object}
          onChange={handleCustomChange}
        />
      )}
    </React.Fragment>
  );
};
