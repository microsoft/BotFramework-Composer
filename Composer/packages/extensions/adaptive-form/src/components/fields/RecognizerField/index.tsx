// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { FieldProps } from '@bfc/extension';
import { SDKTypes, MicrosoftIRecognizer } from '@bfc/shared';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';

import { Section } from '../../AdaptiveForm/Section';

import { RegexRecognizerField } from './RegexRecognizerField';
import ToggleEditor from './ToggleEditor';

const recognizerFields = {
  [SDKTypes.RegexRecognizer]: RegexRecognizerField,
};

const getToggleTitle = (type: string) => {
  const labels = {
    [SDKTypes.RegexRecognizer]: formatMessage('regular expression'),
  };
  return labels[type];
};

const RecognizerField: React.FC<FieldProps<MicrosoftIRecognizer>> = props => {
  const { value, onChange } = props;

  const recognizerOptions = [
    {
      key: 'none',
      text: 'None',
    },
    // {
    //   key: 'luis',
    //   text: 'LUIS',
    // },
    {
      key: SDKTypes.RegexRecognizer,
      text: formatMessage('Regular Expression'),
    },
  ];
  // show select for available recognizers
  // available = regex + recognizer with ui:field
  const isRegex = typeof value === 'object' && value.$type === SDKTypes.RegexRecognizer;

  const getRecognizerType = (): string => {
    if (typeof value === 'string') {
      return SDKTypes.LuisRecognizer;
    }

    if (isRegex) {
      return SDKTypes.RegexRecognizer;
    }

    return 'none';
  };

  const handleChangeRecognizerType = (_, option?: IDropdownOption): void => {
    if (option) {
      switch (option.key) {
        case 'none': {
          onChange(undefined);
          return;
        }
        case SDKTypes.RegexRecognizer: {
          onChange({ $type: SDKTypes.RegexRecognizer, intents: [] });
          return;
        }
        default:
          return;
      }
    }
  };

  const Field: React.FC<FieldProps> | undefined = recognizerFields[getRecognizerType()];

  return (
    <Section
      description={() => (
        <React.Fragment>
          To understand what the user says, your dialog needs a &lsquo;Recognizer&rsquo; that includes example words and
          sentences that users may use.
          <br />
          <br />
          <a href="https://aka.ms/BFC-Using-LU" rel="noopener noreferrer" target="_blank">
            {formatMessage('Learn More')}
          </a>
        </React.Fragment>
      )}
      title="Language Understanding"
    >
      <div>
        <Dropdown
          label={formatMessage('Recognizer Type')}
          options={recognizerOptions}
          responsiveMode={ResponsiveMode.large}
          selectedKey={getRecognizerType()}
          onChange={handleChangeRecognizerType}
        />
        {value && (
          <ToggleEditor key={getRecognizerType()} title={getToggleTitle(getRecognizerType())}>
            {Field && <Field {...props} />}
          </ToggleEditor>
        )}
      </div>
    </Section>
  );
};

export { RecognizerField };
