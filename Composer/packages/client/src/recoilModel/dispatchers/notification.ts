/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { v4 as uuid } from 'uuid';

import { notificationsState } from '../atoms/appState';
import { CardProps } from '../../components/NotificationCard';
import { Notification } from '../../recoilModel/types';

export const createNotifiction = (notificationCard: CardProps): Notification => {
  const id = uuid(6) + '';
  return { id, ...notificationCard };
};

export const addNotificationInternal = ({ set }: CallbackInterface, notification: Notification) => {
  set(notificationsState, (notifications) => [...notifications, notification]);
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
  const addNotification = useRecoilCallback((callbackHelper: CallbackInterface) => (notification: Notification) => {
    return addNotificationInternal(callbackHelper, notification);
  });

  const deleteNotification = useRecoilCallback((callbackHelper: CallbackInterface) => (id: string) => {
    deleteNotificationInternal(callbackHelper, id);
  });

  return {
    addNotification,
    deleteNotification,
  };
};
