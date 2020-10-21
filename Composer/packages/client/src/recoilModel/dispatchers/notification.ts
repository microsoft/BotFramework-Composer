/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { v4 as uuid } from 'uuid';

import { notificationsState, notificationIdsState } from '../atoms/appState';
import { CardProps } from '../../components/NotificationCard';
import { Notification } from '../../recoilModel/types';

export const createNotifiction = (notificationCard: CardProps): Notification => {
  const id = uuid(6) + '';
  return { id, ...notificationCard };
};

export const addNotificationInternal = ({ set }: CallbackInterface, notification: Notification) => {
  set(notificationsState(notification.id), notification);
  set(notificationIdsState, (ids) => [...ids, notification.id]);
};

export const deleteNotificationInternal = ({ reset, set }: CallbackInterface, id: string) => {
  reset(notificationsState(id));
  set(notificationIdsState, (notifications) => {
    return notifications.filter((notification) => notification !== id);
  });
};
export const updateNotificationInternal = ({ set }: CallbackInterface, id: string, newValue: CardProps) => {
  set(notificationsState(id), { ...newValue, id: id });
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
