// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';

import { NotificationCardType } from '../recoilModel/types';

import { CardProps } from './../components/NotificationCard';
export const getQnaPendingNotification = (url: string): CardProps => {
  return {
    title: formatMessage('Creating your knowledge base'),
    description: formatMessage('Extracting QNA pairs from {url}', { url }),
    type: NotificationCardType.PENDING,
  };
};

export const getQnaSuccessNotification = (callback: () => void): CardProps => {
  return {
    title: formatMessage('Your knowledge base is ready!'),
    type: NotificationCardType.SUCCESS,
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
    type: NotificationCardType.ERROR,
  };
};
