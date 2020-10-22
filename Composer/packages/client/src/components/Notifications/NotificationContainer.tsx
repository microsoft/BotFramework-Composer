// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React from 'react';

import { dispatcherState } from '../../recoilModel';
import { notificationsSelector } from '../../recoilModel/selectors/notificationsSelector';

import { NotificationCard } from './NotificationCard';

// -------------------- Styles -------------------- //

const container = css`
  cursor: default;
  position: absolute;
  right: 0px;
  padding: 6px;
`;

// -------------------- NotificationContainer -------------------- //

export const NotificationContainer = React.memo(() => {
  const notifications = useRecoilValue(notificationsSelector);
  const { deleteNotification, hideNotification } = useRecoilValue(dispatcherState);

  return (
    <div css={container} role="presentation">
      {notifications.map((item) => {
        return (
          <NotificationCard
            key={item.id}
            cardProps={item}
            id={item.id}
            onDismiss={deleteNotification}
            onHide={hideNotification}
          />
        );
      })}
    </div>
  );
});
