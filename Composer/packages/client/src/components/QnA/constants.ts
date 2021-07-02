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

export type CreateQnAFromQnAMakerFormData = {
  name: string;
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
  endpoint?: string;
  kbId?: string;
  kbName?: string;
  subscriptionKey?: string;
};

export type CreateQnAModalProps = {
  projectId: string;
  dialogId: string;
  qnaFiles: QnAFile[];
  initialName?: string;
  subscriptionKey?: string;
  onUpdateInitialName?: (initialName: string) => void;
  onDismiss?: () => void;
  onSubmit: (formData: CreateQnAFormData) => void;
};

export type CreateQnAFromFormProps = {
  projectId: string;
  locales: string[];
  defaultLocale: string;
  currentLocale: string;
  dialogId: string;
  qnaFiles: QnAFile[];
  initialName?: string;
  subscriptionKey?: string;
  onUpdateInitialName?: (initialName: string) => void;
  onDismiss?: () => void;
  onChange: (formData: CreateQnAFormData, disabled: boolean) => void;
};

export type ReplaceQnAModalProps = {
  hidden: boolean;
  projectId: string;
  containerId: string;
  dialogId: string;
  qnaFile: QnAFile | undefined;
  subscriptionKey?: string;
  onDismiss?: () => void;
  onSubmit: (formData: ReplaceQnAModalFormData) => void;
};

export type ReplaceQnAModalFormData = {
  url?: string;
  multiTurn?: boolean;
  endpoint?: string;
  subscriptionKey?: string;
  kbId?: string;
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

export const QnAMakerLearnMoreUrl = 'https://aka.ms/composer-addqnamaker-learnmore';
