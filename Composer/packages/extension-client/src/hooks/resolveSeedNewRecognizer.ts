// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ShellData } from '@botframework-composer/types';
import { Templates } from 'botbuilder-lg';
import mapValues from 'lodash/mapValues';

import { RecognizerOptions } from '../types';

const evaluateAsLGTemplate = (input: string, scope: any) => {
  const StringInterpolationPattern = new RegExp(/\$\{.+\}/);
  if (!StringInterpolationPattern.test(input)) return input;

  const templateId = 'fieldValue';
  const lgContent = `# ${templateId}\r\n- ${input}`;
  try {
    const lgResult = Templates.parseText(lgContent).evaluate(templateId, scope);
    return lgResult ?? input;
  } catch (err) {
    return input;
  }
};

export const resolveSeedNewRecognizer = (recognizerType: string, recognizerOptions: RecognizerOptions) => {
  const { seedNewRecognizer, fields } = recognizerOptions;
  if (seedNewRecognizer) return seedNewRecognizer;
  if (!fields) return undefined;

  return (shellData: ShellData) => {
    const mappedFields = mapValues(fields, (fieldVal) => {
      if (typeof fieldVal === 'string') {
        return evaluateAsLGTemplate(fieldVal, shellData);
      }
      return fieldVal;
    });
    const recognizerInstance = {
      $kind: recognizerType,
      ...mappedFields,
    };
    return recognizerInstance;
  };
};
