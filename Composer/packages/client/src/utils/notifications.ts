// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';

import { CardProps } from './../components/Notifications/NotificationCard';
export const getQnaPendingNotification = (url: string): CardProps => {
  return {
    title: formatMessage('Creating your knowledge base'),
    description: formatMessage('Extracting QNA pairs from {url}', { url }),
    type: 'pending',
  };
};

export const getQnaSuccessNotification = (callback: () => void): CardProps => {
  return {
    title: formatMessage('Your knowledge base is ready!'),
    type: 'success',
    retentionTime: 5000,
    link: {
      label: formatMessage('View KB'),
      onClick: callback,
    },
  };
};

export const getQnaFailedNotification = (error: string): CardProps => {
  return {
    title: formatMessage('There was error creating your KB'),
    description: error,
    type: 'error',
  };
};
