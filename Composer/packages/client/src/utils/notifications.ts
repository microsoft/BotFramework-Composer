// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';

import { NotificationCardTypes } from '../recoilModel/types';

import { CardProps } from './../components/NotificationCard';
export const getQnaPendingNotification = (url: string): CardProps => {
  return {
    title: formatMessage('Creating your knowledge base'),
    description: formatMessage('Extracting QNA pairs from {url}', { url }),
    type: NotificationCardTypes.PENDING,
  };
};

export const getQnaSuccessNotification = (callback: () => void): CardProps => {
  return {
    title: formatMessage('Your knowledge base Surface go FAQ is ready!'),
    type: NotificationCardTypes.SUCCESS,
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
    type: NotificationCardTypes.ERROR,
  };
};
