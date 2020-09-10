// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';

import { notificationsState, dispatcherState } from '../recoilModel';

import { NotificationCard } from './NotificationCard';

// -------------------- Styles -------------------- //

const container = css`
  cursor: default;
  position: absolute;
  right: 0px;
  padding: 6px;
`;

// -------------------- NotificationContainer -------------------- //

export const NotificationContainer = () => {
  const notifications = useRecoilValue(notificationsState);
  const { deleteNotification } = useRecoilValue(dispatcherState);

  return (
    <div css={container} role="presentation">
      {notifications.map((item) => {
        return <NotificationCard key={item.id} {...item} onDismiss={deleteNotification} />;
      })}
    </div>
  );
};
