// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';

import { NotificationType } from './../components/NotificationCard';
import { ICardProps } from './../components/NotificationCard';
export const getQnAPending = (urls: string[]) => {
  return {
    title: formatMessage('Creating your knowledge base'),
    description: formatMessage('Extacting QnA pairs from ') + urls.join(' '),
    type: NotificationType.loading,
  };
};

export const getQnASuccess = (callback: () => void): ICardProps => {
  return {
    title: formatMessage('Your knowledge base Surface go FAQ is ready!'),
    description: '',
    type: NotificationType.success,
    retentionTime: 5000,
    link: {
      label: formatMessage('View KB'),
      onClick: callback,
    },
  };
};

export const getQnAFailed = (error: string) => {
  return {
    title: formatMessage('There was error creating your KB'),
    description: error,
    type: NotificationType.error,
  };
};
