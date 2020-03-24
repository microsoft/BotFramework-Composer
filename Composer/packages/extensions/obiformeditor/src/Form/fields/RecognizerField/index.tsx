// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from 'react';
import formatMessage from 'format-message';
import cloneDeep from 'lodash/cloneDeep';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { LuFile } from '@bfc/indexers';
import { SDKTypes } from '@bfc/shared';

import { BaseField } from '../BaseField';
import { WidgetLabel } from '../../widgets/WidgetLabel';

import './styles.css';
import { IRecognizer, ICheckOption, IRecognizerType } from './types';

const defaultOptions: ICheckOption[] = [
  {
    checked: false,
    disabled: false,
    label: 'LUIS',
    id: 'luis',
  },
  {
    checked: false,
    disabled: false,
    label: formatMessage('Regular Expression'),
    id: 'regex',
  },
];

const defaultRecoginzerSet: IRecognizer = {
  $type: 'Microsoft.RecognizerSet',
  recognizers: [
    {
      $type: 'Microsoft.MultiLanguageRecognizer',
      recognizers: {
        'en-us': {
          $type: 'Microsoft.CrossTrainedRecognizerSet',
          recognizers: [],
        },
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

  let recognizers: IRecognizerType[] = [];
  if (typeof formData === 'object' && formData.$type === 'Microsoft.RecognizerSet') {
    formData.recognizers[0].recognizers?.['en-us'].recognizers.forEach(recog => {
      recognizers.push(recog);
    });
  } else {
    recognizers.push({
      $type: SDKTypes.ValueRecognizer,
      id: 'value',
    });
  }
  const currentDialogId = currentDialog.id;
  const selectedFile: LuFile | void = luFiles.find(f => f.id === `${currentDialogId}.${locale}`);
  const [checkOptions, setCheckOptions] = useState(
    defaultOptions.map(opt => {
      if (recognizers.find(recog => recog.id === opt.id)) {
        opt.checked = true;
      }
      return opt;
    })
  );

  const stackTokens = { childrenGap: 10 };

  useEffect(() => {
    if (!formData) {
      onChange(defaultRecoginzerSet);
    }
  }, [formData]);
  const handleChange = (id: string, checked?: boolean): void => {
    const finalRecognizerSet = cloneDeep(defaultRecoginzerSet);
    switch (id) {
      case 'luis': {
        if (checked) {
          if (selectedFile) {
            recognizers.push({
              $type: SDKTypes.LuisRecognizer,
              id: 'luis',
            });
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
            recognizers.push({
              $type: SDKTypes.LuisRecognizer,
              id: 'luis',
            });
            createLuFile(currentDialogId);
          }
        } else {
          recognizers = recognizers.filter(recog => recog.id !== 'luis');
        }
        break;
      }
      case 'regex': {
        if (checked) {
          recognizers.push({
            $type: SDKTypes.RegexRecognizer,
            id: 'regex',
          });
        } else {
          recognizers = recognizers.filter(recog => recog.id !== 'regex');
        }
        break;
      }
      default:
        break;
    }
    if (finalRecognizerSet.recognizers[0].recognizers) {
      finalRecognizerSet.recognizers[0].recognizers['en-us'].recognizers = Object.assign([], recognizers);
    }
    checkOptions.map(option => {
      if (option.id === id) {
        option.checked = !!checked;
      }
    });
    setCheckOptions(checkOptions);
    onChange(finalRecognizerSet);
  };

  return (
    <div className="RecognizerField">
      <BaseField {...props}>
        <Stack tokens={stackTokens}>
          <WidgetLabel label="Recognizer"></WidgetLabel>
          {checkOptions.map((option, index) => (
            <Checkbox
              label={option.label}
              key={index}
              defaultChecked={option.checked}
              disabled={option.disabled}
              onChange={(_, checked?: boolean) => handleChange(option.id, checked)}
            />
          ))}
        </Stack>
      </BaseField>
    </div>
  );
};
