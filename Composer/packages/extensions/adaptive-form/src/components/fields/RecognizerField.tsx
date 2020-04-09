// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useMemo, useEffect } from 'react';
import { FieldProps, useShellApi, IRecognizer, ICrossTrainedRecognizerSet, IRecognizerType } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';
import cloneDeep from 'lodash/cloneDeep';

import PluginContext from '../../PluginContext';
import { FieldLabel } from '../FieldLabel';

const defaultRecoginzerSet: IRecognizer = {
  $kind: SDKKinds.RecognizerSet,
  recognizers: [
    {
      $kind: SDKKinds.MultiLanguageRecognizer,
      recognizers: {
        'en-us': '',
      },
    },
    {
      $kind: SDKKinds.ValueRecognizer,
      id: 'value',
    },
  ],
};

const RecognizerField: React.FC<FieldProps<IRecognizer>> = props => {
  const { value, id, label, description, uiOptions, onChange } = props;
  const { shellApi, ...shellData } = useShellApi();
  const { recognizers } = useContext(PluginContext);
  let recognizer: IRecognizerType | string | ICrossTrainedRecognizerSet = '';
  if (typeof value === 'object' && value.$kind === SDKKinds.RecognizerSet) {
    recognizer = value.recognizers[0].recognizers?.['en-us'] || {
      $kind: SDKKinds.ValueRecognizer,
      id: 'value',
    };
  } else {
    recognizer = {
      $kind: SDKKinds.ValueRecognizer,
      id: 'value',
    };
  }
  useEffect(() => {
    if (!recognizer) {
      onChange(defaultRecoginzerSet);
    }
  }, [recognizer]);
  const options = useMemo(() => {
    return recognizers.map(r => ({
      key: r.id,
      text: typeof r.displayName === 'function' ? r.displayName(recognizer) : r.displayName,
    }));
  }, [recognizers]);

  const selectedType = useMemo(() => {
    const selected = recognizers.filter(r => r.isSelected(recognizer)).map(r => r.id);

    if (selected.length !== 1) {
      console.error(
        `Unable to determine selected recognizer.\n
         Value: ${JSON.stringify(value)}.\n
         Selected Recognizers: [${selected.join(', ')}]`
      );
      return;
    }

    return selected[0];
  }, [value]);

  const handleChangeRecognizerType = (_, option?: IDropdownOption): void => {
    if (option) {
      const handler = recognizers.find(r => r.id === option.key)?.handleRecognizerChange;
      const fallback = (data: string | IRecognizerType | ICrossTrainedRecognizerSet) => {
        const finalRecognizerSet = cloneDeep(defaultRecoginzerSet);
        if (finalRecognizerSet.recognizers[0].recognizers) {
          finalRecognizerSet.recognizers[0].recognizers['en-us'] = data;
        }
        onChange(finalRecognizerSet);
      };

      if (handler) {
        handler(props, shellData, shellApi, fallback);
      }
    }
  };

  return (
    <React.Fragment>
      <FieldLabel id={id} label={label} description={description} helpLink={uiOptions?.helpLink} />
      {selectedType ? (
        <Dropdown
          label={formatMessage('Recognizer Type')}
          options={options}
          responsiveMode={ResponsiveMode.large}
          selectedKey={selectedType}
          onChange={handleChangeRecognizerType}
        />
      ) : (
        `Unable to determine recognizer type from data: ${value}`
      )}
    </React.Fragment>
  );
};

export { RecognizerField };
