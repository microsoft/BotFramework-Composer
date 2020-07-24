// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecognizerSchema } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';

import { RegexIntentField } from './components/fields/RegexIntentField';

const DefaultRecognizers: RecognizerSchema[] = [
  {
    id: SDKKinds.RegexRecognizer,
    displayName: () => formatMessage('Regular Expression recognizer(Regex)'),
    editor: RegexIntentField,
    isSelected: (data) => {
      return typeof data === 'object' && data.$kind === SDKKinds.RegexRecognizer;
    },
    handleRecognizerChange: (props) => {
      props.onChange({ $kind: SDKKinds.RegexRecognizer, intents: [] });
    },
  },
  {
    id: 'Custom',
    displayName: () => formatMessage('Custom recognizer'),
    isSelected: (data) => typeof data === 'object',
    handleRecognizerChange: (props) => props.onChange({}),
  },
];

export default DefaultRecognizers;
