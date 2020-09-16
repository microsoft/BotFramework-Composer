// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import { MicrosoftIRecognizer } from '@bfc/shared';
import get from 'lodash/get';

import { EditorExtensionContext } from '../EditorExtensionContext';
import { RecognizerOptions, RecognizerSchema } from '../types';

export const FallbackRecognizerKey = 'fallback';

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

  // Use the JSON editor as fallback recognizer config.
  const fallbackRecognizer = recognizers.find((x) => x.id === 'fallback');

  const findConfigByValue = (recognizerValue?: MicrosoftIRecognizer) => {
    const matchedRecognizer = recognizers.find((r) => {
      if (typeof r.isSelected === 'function') {
        return r.isSelected(recognizerValue);
      }
      return r.id === get(recognizerValue, '$kind');
    });
    return matchedRecognizer ?? fallbackRecognizer;
  };

  return {
    recognizers,
    findRecognizer: findConfigByValue,
  };
}
