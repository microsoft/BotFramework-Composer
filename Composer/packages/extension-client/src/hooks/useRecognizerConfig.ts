// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import { MicrosoftIRecognizer, SDKKinds } from '@bfc/types';
import get from 'lodash/get';

import { EditorExtensionContext } from '../EditorExtensionContext';
import { RecognizerOptions, RecognizerSchema } from '../types';

export const FallbackRecognizerKey = 'fallback';

// TODO: (ze) remove this logic after the ui widget PR. [issue #4167]
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

const getFallbackRecognizer = (recognizers: RecognizerSchema[]) => {
  return recognizers.find((r) => r.id === FallbackRecognizerKey);
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

export interface RecognizerSchemaConfig {
  /** All recognizer definitions from uischema. */
  recognizers: RecognizerSchema[];
  /** Current dialog's in-use recognizer definition. */
  currentRecognizer?: RecognizerSchema;
  /** Default recognizer's definition, used when creating new dialog. */
  defaultRecognizer?: RecognizerSchema;
}

export function useRecognizerConfig(): RecognizerSchemaConfig {
  const { plugins, shellData } = useContext(EditorExtensionContext);

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

  const defaultRecognizer = getDefaultRecognizer(recognizers);
  const fallbackRecognizer = getFallbackRecognizer(recognizers);

  const currentRecognizerValue = shellData.currentDialog?.content?.recognizer;
  const currentRecognizer = findRecognizerByValue(recognizers, currentRecognizerValue) ?? fallbackRecognizer;

  return {
    recognizers,
    currentRecognizer,
    defaultRecognizer,
  };
}
