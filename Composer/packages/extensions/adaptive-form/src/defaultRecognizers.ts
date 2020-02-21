// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecognizerSchema } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';
import formatMessage from 'format-message';

import { RegexRecognizerField } from './components/fields/RecognizerField/RegexRecognizerField';

const DefaultRecognizers: RecognizerSchema[] = [
  {
    id: 'none',
    displayName: () => formatMessage('None'),
    handleChange: props => props.onChange(undefined),
  },
  {
    id: SDKTypes.RegexRecognizer,
    displayName: () => formatMessage('Regular Expression'),
    editor: RegexRecognizerField,
    handleChange: props => {
      props.onChange({ $type: SDKTypes.RegexRecognizer, intents: [] });
    },
  },
];

export default DefaultRecognizers;
