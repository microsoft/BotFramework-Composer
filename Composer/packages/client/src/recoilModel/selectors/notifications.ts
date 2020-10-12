// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selector } from 'recoil';

import { notificationIdsState, notificationsState } from '../atoms/appState';

export const notificationsSelector = selector({
  key: 'notificationsSelector',
  get: ({ get }) => {
    const ids = get(notificationIdsState);
    const notifications = ids.map((id) => get(notificationsState(id)));
    return notifications;
  },
});
