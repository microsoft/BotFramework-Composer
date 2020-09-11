// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { QnAFile } from '@bfc/shared';
import formatMessage from 'format-message';

import { FieldValidator } from '../../hooks/useForm';

export const validateUrl: FieldValidator = (url: string): string => {
  let error = '';

  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    error = formatMessage('A valid url should start with http:// or https://');
  }

  return error;
};

export const QnANameRegex = /^\w[-\w]*$/;

export const validateName = (sources: QnAFile[]): FieldValidator => {
  return (name: string) => {
    let currentError = '';
    if (name) {
      if (!QnANameRegex.test(name)) {
        currentError = formatMessage('Name contains invalid charactors');
      }

      const duplicatedItemIndex = sources.findIndex((item) => item.name === name);
      if (duplicatedItemIndex > -1) {
        currentError = formatMessage('Duplicate imported QnA name');
      }
    }
    return currentError;
  };
};

export const knowledgeBaseSourceUrl =
  'https://docs.microsoft.com/en-us/azure/cognitive-services/qnamaker/concepts/content-types';

export const QnAMakerLearningUrl = 'https://azure.microsoft.com/en-us/pricing/details/cognitive-services/qna-maker/';
