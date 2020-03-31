// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, ReactElement } from 'react';
import formatMessage from 'format-message';
import cloneDeep from 'lodash/cloneDeep';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { LuFile } from '@bfc/indexers';
import { SDKTypes } from '@bfc/shared';
import { IDropdownOption, Dropdown, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

import { BaseField } from '../BaseField';

import './styles.css';
import { IRecognizer, IRecognizerType } from './types';

const defaultRecoginzerSet: IRecognizer = {
  $type: 'Microsoft.RecognizerSet',
  recognizers: [
    {
      $type: 'Microsoft.MultiLanguageRecognizer',
      recognizers: {
        'en-us': '',
      },
    },
    {
      $type: SDKTypes.ValueRecognizer,
      id: 'value',
    },
  ],
};

export const RecognizerField: React.FC<FieldProps<IRecognizer | undefined>> = props => {
  const { formData } = props;

  const {
    formContext: { luFiles, shellApi, currentDialog, locale },
    onChange,
  } = props;
  const [loading, setLoading] = useState(false);
  const currentDialogId = currentDialog.id;
  const selectedFile: LuFile | void = luFiles.find(f => f.id === `${currentDialogId}.${locale}`);

  let recognizer: IRecognizerType | string = '';
  if (typeof formData === 'object' && formData.$type === 'Microsoft.RecognizerSet') {
    recognizer = formData.recognizers[0].recognizers?.['en-us'] || {
      $type: SDKTypes.ValueRecognizer,
      id: 'value',
    };
  } else {
    recognizer = {
      $type: SDKTypes.ValueRecognizer,
      id: 'value',
    };
  }
  const isRegex = typeof recognizer === 'object' && recognizer.$type === SDKTypes.RegexRecognizer;
  const options = [
    {
      key: 'value',
      text: formatMessage('Value'),
    },
    {
      key: 'luis',
      text: 'LUIS',
    },
    {
      key: 'regex',
      text: formatMessage('Regular Expression'),
    },
  ];

  const getSelectedType = (): string => {
    if (typeof recognizer === 'string' && !!recognizer) {
      return 'luis';
    }

    if (isRegex) {
      return 'regex';
    }

    return 'value';
  };

  const onRenderTitle = (options?: IDropdownOption[]): ReactElement => {
    if (loading || !options) {
      return (
        <div style={{ height: '100%', display: 'flex' }}>
          <Spinner size={SpinnerSize.small} />
        </div>
      );
    }

    const selectedOption = options.find(o => o.key === getSelectedType());

    if (selectedOption) {
      return <span>{selectedOption.text}</span>;
    }

    return <span />;
  };
  const handleChange = (_, option?: IDropdownOption): void => {
    const finalRecognizerSet = cloneDeep(defaultRecoginzerSet);
    if (option) {
      switch (option.key) {
        case 'luis': {
          if (selectedFile) {
            recognizer = `${currentDialogId}.lu`;
          } else {
            const { createLuFile } = shellApi;

            /**
             * The setTimeouts are used to get around the
             * 1. allows the store to update with the luFile creation
             * 2. allows the debounced onChange to be invoked
             *
             * This is a hack, but dialogs will be created along with
             * lu and lg files so this code path shouldn't be executed.
             */
            setLoading(true);
            createLuFile(currentDialogId).then(() => {
              setTimeout(() => {
                setTimeout(() => {
                  setLoading(false);
                }, 750);
              }, 500);
            });
            recognizer = `${currentDialogId}.lu`;
          }
          break;
        }
        case 'regex': {
          recognizer = {
            $type: SDKTypes.RegexRecognizer,
            id: 'regex',
          };

          break;
        }
        default:
          recognizer = '';
          break;
      }
      if (finalRecognizerSet.recognizers[0].recognizers) {
        finalRecognizerSet.recognizers[0].recognizers['en-us'] = recognizer;
      }
      onChange(finalRecognizerSet);
    }
  };

  return (
    <div className="RecognizerField">
      <BaseField {...props}>
        <Dropdown
          label={formatMessage('Recognizer Type')}
          onChange={handleChange}
          options={options}
          selectedKey={getSelectedType()}
          responsiveMode={ResponsiveMode.large}
          onRenderTitle={onRenderTitle}
        />
      </BaseField>
    </div>
  );
};
