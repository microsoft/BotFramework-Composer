/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { v4 as uuid } from 'uuid';

import { notificationsState } from '../atoms/appState';
import { ICardProps } from '../../components/NotificationCard';

export const addNotificationInternal = ({ set }: CallbackInterface, notification: ICardProps) => {
  const id = uuid(6);
  set(notificationsState, (notifications) => [...notifications, { id, cardProps: notification }]);
  return id;
};

export const deleteNotificationInternal = ({ set }: CallbackInterface, id: string) => {
  set(notificationsState, (items) => {
    const notifications = [...items];
    const index = notifications.findIndex((item) => item.id === id);
    if (index > -1) {
      notifications.splice(index, 1);
    }
    return notifications;
  });
};

export const notificationDispatcher = () => {
  const addNotification = useRecoilCallback(
    (callbackHelper: CallbackInterface) => (notification: ICardProps): string => {
      return addNotificationInternal(callbackHelper, notification);
    }
  );

  const deleteNotification = useRecoilCallback((callbackHelper: CallbackInterface) => (id: string) => {
    deleteNotificationInternal(callbackHelper, id);
  });

  return {
    addNotification,
    deleteNotification,
  };
};
