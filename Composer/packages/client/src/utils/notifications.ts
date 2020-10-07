// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';

import { CardProps } from './../components/NotificationCard';

export const getQnaPendingNotification = (urls: string[]): CardProps => {
  return {
    title: formatMessage('Creating your knowledge base'),
    description: formatMessage('Extracting QNA pairs from {urls}', { urls: urls.join(' ') }),
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
