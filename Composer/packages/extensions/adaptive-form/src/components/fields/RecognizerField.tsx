// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo } from 'react';
import { FieldProps, useShellApi, useRecognizerConfig } from '@bfc/extension';
import { MicrosoftIRecognizer } from '@bfc/shared';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';

import { FieldLabel } from '../FieldLabel';

const RecognizerField: React.FC<FieldProps<MicrosoftIRecognizer>> = (props) => {
  const { value, id, label, description, uiOptions, required } = props;
  const { shellApi, ...shellData } = useShellApi();
  const recognizers = useRecognizerConfig();

  const options = useMemo(() => {
    return recognizers.map((r) => ({
      key: r.id,
      text: typeof r.displayName === 'function' ? r.displayName(value) : r.displayName,
    }));
  }, [recognizers]);

  const selectedType = useMemo(() => {
    const selected = recognizers.filter((r) => r.isSelected(value)).map((r) => r.id);

    if (selected.length !== 1) {
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

    return selected[0];
  }, [value]);

  const handleChangeRecognizerType = (_, option?: IDropdownOption): void => {
    if (option) {
      const handler = recognizers.find((r) => r.id === option.key)?.handleRecognizerChange;

      if (handler) {
        handler(props, shellData, shellApi);
      }
    }
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
    </React.Fragment>
  );
};

export { RecognizerField };
