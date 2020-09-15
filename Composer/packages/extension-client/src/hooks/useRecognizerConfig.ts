// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext } from 'react';
import { MicrosoftIRecognizer } from '@bfc/shared';
import get from 'lodash/get';

import { EditorExtensionContext } from '../EditorExtensionContext';

export function useRecognizerConfig() {
  const { plugins } = useContext(EditorExtensionContext);

  const recognizers = plugins.recognizers ?? [];
  const findConfigByValue = (recognizerValue: MicrosoftIRecognizer) => {
    return recognizers.find((r) => {
      if (typeof r.isSelected === 'function') {
        return r.isSelected(recognizerValue);
      }
      return r.id === get(recognizerValue, '$kind');
    });
  };

  return {
    recognizers,
    findRecognizer: findConfigByValue,
  };
}
