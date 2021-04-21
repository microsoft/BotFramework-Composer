/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { v4 as uuid } from 'uuid';

import { notificationsState, notificationIdsState } from '../atoms/appState';
import { CardProps } from '../../components/Notifications/NotificationCard';
import { Notification } from '../../recoilModel/types';

export const createNotification = (notificationCard: CardProps): Notification => {
  const id = uuid(6) + '';
  return { id, ...notificationCard };
};

export const addNotificationInternal = ({ set }: CallbackInterface, notification: Notification) => {
  set(notificationsState(notification.id), notification);
  set(notificationIdsState, (ids) => [notification.id, ...ids]);
};

export const deleteNotificationInternal = ({ reset, set }: CallbackInterface, id: string) => {
  reset(notificationsState(id));
  set(notificationIdsState, (notifications) => {
    return notifications.filter((notification) => notification !== id);
  });
};
export const updateNotificationInternal = ({ set }: CallbackInterface, id: string, newValue: CardProps) => {
  set(notificationsState(id), { ...newValue, id: id });
  // check if notification exist
  set(notificationIdsState, (notificationIds) => {
    if (notificationIds.some((notificationId) => notificationId === id)) {
      return notificationIds;
    } else {
      return [...notificationIds, id];
    }
  });
};
export const notificationDispatcher = () => {
  const addNotification = useRecoilCallback((callbackHelper: CallbackInterface) => (notification: Notification) => {
    return addNotificationInternal(callbackHelper, notification);
  });

  const deleteNotification = useRecoilCallback((callbackHelper: CallbackInterface) => (id: string) => {
    deleteNotificationInternal(callbackHelper, id);
  });

  const markNotificationAsRead = useRecoilCallback(({ set }: CallbackInterface) => (id: string) => {
    set(notificationsState(id), (notification) => ({ ...notification, read: true, hidden: true }));
  });

  const hideNotification = useRecoilCallback(({ set }: CallbackInterface) => (id: string) => {
    set(notificationsState(id), (notification) => ({ ...notification, hidden: true }));
  });

  const updateNotification = useRecoilCallback(
    (callbackHelper: CallbackInterface) => (id: string, newValue: CardProps) => {
      updateNotificationInternal(callbackHelper, id, newValue);
    }
  );

  return {
    addNotification,
    deleteNotification,
    hideNotification,
    markNotificationAsRead,
    updateNotification,
  };
};
