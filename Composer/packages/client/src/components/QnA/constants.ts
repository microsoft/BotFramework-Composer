// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { QnAFile } from '@bfc/shared';
import formatMessage from 'format-message';

import { FieldValidator } from '../../hooks/useForm';
import { getBaseName } from '../../utils/fileUtil';

export type CreateQnAFromScratchFormData = {
  name: string;
};

export type CreateQnAFromUrlFormData = {
  urls: string[];
  locales: string[];
  name: string;
  multiTurn: boolean;
};

export type CreateQnAFromUrlFormDataErrors = {
  urls: string[];
  name: string;
};

export type CreateQnAFormData = {
  urls?: string[];
  locales?: string[];
  name: string;
  multiTurn?: boolean;
};

export type CreateQnAFromModalProps = {
  projectId: string;
  dialogId: string;
  qnaFiles: QnAFile[];
  subscriptionKey?: string;
  onDismiss?: () => void;
  onSubmit: (formData: CreateQnAFormData) => void;
};

export type CreateQnAFromUrlModalProps = {
  projectId: string;
  locales: string[];
  defaultLocale: string;
  dialogId: string;
  qnaFiles: QnAFile[];
  subscriptionKey?: string;
  onDismiss?: () => void;
  onSubmit: (formData: CreateQnAFormData) => void;
};

export const validateUrl: FieldValidator = (url: string): string => {
  let error = '';

  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    error = formatMessage('A valid URL should start with http:// or https://');
  }

  return error;
};

export const FileNameRegex = /^[a-zA-Z0-9-_]+$/;

export const validateName = (sources: QnAFile[]): FieldValidator => {
  return (name: string) => {
    let currentError = '';
    if (name) {
      if (!FileNameRegex.test(name)) {
        currentError = formatMessage(
          'A knowledge base name cannot contain spaces or special characters. Use letters, numbers, -, or _.'
        );
      }

      const duplicatedItemIndex = sources.findIndex(
        (item) => getBaseName(item.id.toLowerCase()) === `${name.toLowerCase()}.source`
      );
      if (duplicatedItemIndex > -1) {
        currentError = formatMessage('You already have a KB with that name. Choose another name and try again.');
      }
    }
    return currentError;
  };
};

export const knowledgeBaseSourceUrl = 'https://aka.ms/qna-data-source-content';

export const QnAMakerLearningUrl = 'https://aka.ms/qna-maker-pricing';
