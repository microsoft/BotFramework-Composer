// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import { MicrosoftIRecognizer } from '@bfc/shared';
import get from 'lodash/get';

import { EditorExtensionContext } from '../EditorExtensionContext';
import { RecognizerOptions, RecognizerSchema } from '../types';

export function useRecognizerConfig() {
  const { plugins } = useContext(EditorExtensionContext);

  const recognizers: RecognizerSchema[] = useMemo(() => {
    if (!plugins.uiSchema) return [];

    return Object.entries(plugins.uiSchema)
      .filter(([_, uiOptions]) => uiOptions && uiOptions.recognizer)
      .map(([$kind, uiOptions]) => {
        const recognizerOptions = uiOptions?.recognizer as RecognizerOptions;
        return {
          id: $kind,
          ...recognizerOptions,
        } as RecognizerSchema;
      });
  }, [plugins.uiSchema]);

  const findConfigByValue = (recognizerValue?: MicrosoftIRecognizer) => {
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
