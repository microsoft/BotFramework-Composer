// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecognizerSchema } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';

import { RegexIntentField } from './components/fields/RegexIntentField';

const DefaultRecognizers: RecognizerSchema[] = [
  {
    id: 'value',
    displayName: () => formatMessage('Value'),
    isSelected: data => {
      return typeof data === 'object' && data.$kind === SDKKinds.ValueRecognizer;
    },
    handleRecognizerChange: props => props.onChange(undefined),
  },
  {
    id: SDKKinds.RegexRecognizer,
    displayName: () => formatMessage('Regular Expression'),
    editor: RegexIntentField,
    isSelected: data => {
      return typeof data === 'object' && data.$kind === SDKKinds.RegexRecognizer;
    },
    handleRecognizerChange: (props, shellData, shellAPi, fallback) => {
      fallback({ $kind: SDKKinds.RegexRecognizer, intents: [] });
    },
  },
];

export default DefaultRecognizers;
