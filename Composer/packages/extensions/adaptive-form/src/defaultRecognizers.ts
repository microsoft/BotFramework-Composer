// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecognizerSchema } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';
import formatMessage from 'format-message';

import { RegexIntentField } from './components/fields/RegexIntentField';

const DefaultRecognizers: RecognizerSchema[] = [
  {
    id: 'none',
    displayName: () => formatMessage('None'),
    handleChange: props => props.onChange(undefined),
  },
  {
    id: SDKTypes.RegexRecognizer,
    displayName: () => formatMessage('Regular Expression'),
    editor: RegexIntentField,
    handleChange: props => {
      props.onChange({ $type: SDKTypes.RegexRecognizer, intents: [] });
    },
  },
];

export default DefaultRecognizers;
