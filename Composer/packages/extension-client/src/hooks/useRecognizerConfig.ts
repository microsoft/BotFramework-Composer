// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import { MicrosoftIRecognizer } from '@bfc/shared';
import get from 'lodash/get';
import mapValues from 'lodash/mapValues';

import { EditorExtensionContext } from '../EditorExtensionContext';
import { RecognizerSchema } from '../types';
import { RecognizerOptions } from '../types/recognizerSchema';

export function useRecognizerConfig() {
  const { plugins } = useContext(EditorExtensionContext);

  const recognizers: RecognizerSchema[] = useMemo(() => {
    const recognizerOptionMap: { [key: string]: RecognizerOptions } = mapValues(plugins.uiSchema, 'recognizer');
    // recover the id field as required from map's key.
    return Object.entries(recognizerOptionMap).map(([$kind, options]) => ({
      id: $kind,
      ...options,
    }));
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
