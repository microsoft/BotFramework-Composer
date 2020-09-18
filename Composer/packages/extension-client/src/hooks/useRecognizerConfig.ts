// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import { MicrosoftIRecognizer, SDKKinds } from '@bfc/shared';
import get from 'lodash/get';

import { EditorExtensionContext } from '../EditorExtensionContext';
import { RecognizerOptions, RecognizerSchema } from '../types';

export const FallbackRecognizerKey = 'fallback';

// TODO: (ze) remove this logic after the ui widget PR.
const reuseLuisIntentEditor = (recognizers: RecognizerSchema[]) => {
  const crosstrainRecognizer = recognizers.find((x) => x.id === SDKKinds.CrossTrainedRecognizerSet);
  const luisRecognizer = recognizers.find((x) => x.id === SDKKinds.LuisRecognizer);
  if (crosstrainRecognizer && luisRecognizer) {
    crosstrainRecognizer.intentEditor = luisRecognizer.intentEditor;
  }
};

const getDefaultRecognizer = (recognizers: RecognizerSchema[]) => {
  const defaultRecognizer = recognizers.find((r) => r.default && !r.disabled);
  if (defaultRecognizer) return defaultRecognizer;

  // TODO: (ze) remove this logic after recognizer config is port to SDK component schema.
  const crosstrainRecognizer = recognizers.find((r) => r.id === SDKKinds.CrossTrainedRecognizerSet);
  if (crosstrainRecognizer) return crosstrainRecognizer;

  const firstAvailableRecognizer = recognizers.find((r) => !r.disabled);
  return firstAvailableRecognizer;
};

const findRecognizerByValue = (recognizers: RecognizerSchema[], recognizerValue?: MicrosoftIRecognizer) => {
  const matchedRecognizer = recognizers.find((r) => {
    if (typeof r.isSelected === 'function') {
      return r.isSelected(recognizerValue);
    }
    return r.id === get(recognizerValue, '$kind');
  });
  return matchedRecognizer;
};

export function useRecognizerConfig() {
  const { plugins } = useContext(EditorExtensionContext);

  const recognizers: RecognizerSchema[] = useMemo(() => {
    if (!plugins.uiSchema) return [];

    const schemas = Object.entries(plugins.uiSchema)
      .filter(([_, uiOptions]) => uiOptions && uiOptions.recognizer)
      .map(([$kind, uiOptions]) => {
        const recognizerOptions = uiOptions?.recognizer as RecognizerOptions;
        return {
          id: $kind,
          ...recognizerOptions,
        } as RecognizerSchema;
      });
    reuseLuisIntentEditor(schemas);
    return schemas;
  }, [plugins.uiSchema]);

  const fallbackRecognizer = recognizers.find((x) => x.id === 'fallback');

  return {
    recognizers,
    findRecognizer: (recognizerValue) => findRecognizerByValue(recognizers, recognizerValue) ?? fallbackRecognizer,
    getDefaultRecognizer: () => getDefaultRecognizer(recognizers),
  };
}
