// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import { MicrosoftIRecognizer, SDKKinds } from '@bfc/types';
import get from 'lodash/get';

import { EditorExtensionContext } from '../EditorExtensionContext';
import { RecognizerOptions, RecognizerSchema } from '../types';

export const FallbackRecognizerKey = 'fallback';

const resolveRecognizerWidget = (widgetValue: any, recognizerWidgets: { [name: string]: any }) => {
  if (typeof widgetValue === 'string' && recognizerWidgets[widgetValue]) {
    return recognizerWidgets[widgetValue];
  }
  return widgetValue;
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

    const recognizerWidgets = plugins.widgets?.recognizer ?? {};
    const schemas = Object.entries(plugins.uiSchema)
      .filter(([_, uiOptions]) => uiOptions && uiOptions.recognizer)
      .map(([$kind, uiOptions]) => {
        const recognizerOptions = uiOptions?.recognizer as RecognizerOptions;
        const intentEditor = resolveRecognizerWidget(recognizerOptions.intentEditor, recognizerWidgets);
        return {
          id: $kind,
          ...recognizerOptions,
          intentEditor,
        } as RecognizerSchema;
      });
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
