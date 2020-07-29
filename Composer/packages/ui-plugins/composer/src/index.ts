// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig, FormUISchema, RecognizerSchema } from '@bfc/extension';
import { IntentField, RecognizerField, RegexIntentField } from '@bfc/adaptive-form';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';
import mapValues from 'lodash/mapValues';

const DefaultRecognizers: RecognizerSchema[] = [
  {
    id: 'none',
    displayName: () => formatMessage('None'),
    isSelected: (data) => data === undefined,
    handleRecognizerChange: (props) => props.onChange(undefined),
  },
  {
    id: SDKKinds.RegexRecognizer,
    displayName: () => formatMessage('Regular Expression'),
    editor: RegexIntentField,
    isSelected: (data) => {
      return typeof data === 'object' && data.$kind === SDKKinds.RegexRecognizer;
    },
    handleRecognizerChange: (props) => {
      props.onChange({ $kind: SDKKinds.RegexRecognizer, intents: [] });
    },
  },
];

const DefaultFormSchema: FormUISchema = {
  [SDKKinds.IRecognizer]: {
    field: RecognizerField,
    helpLink: 'https://aka.ms/BFC-Using-LU',
  },
  [SDKKinds.OnIntent]: {
    properties: {
      intent: {
        field: IntentField,
      },
    },
  },
};

const config: PluginConfig = {
  uiSchema: mapValues(DefaultFormSchema, (val) => ({ form: val })),
  recognizers: DefaultRecognizers,
};

export default config;
