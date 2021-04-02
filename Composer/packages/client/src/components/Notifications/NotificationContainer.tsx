// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import isEmpty from 'lodash/isEmpty';
import { useRecoilValue } from 'recoil';

import { dispatcherState } from '../../recoilModel';
import { notificationsSelector } from '../../recoilModel/selectors/notifications';

import { NotificationCard } from './NotificationCard';

// -------------------- Styles -------------------- //

const container = css`
  cursor: default;
  position: absolute;
  right: 0px;
  padding: 6px;
  z-index: 1;
`;

// -------------------- NotificationContainer -------------------- //

export const NotificationContainer = () => {
  const notifications = useRecoilValue(notificationsSelector).filter(({ hidden }) => !hidden);
  const { deleteNotification, hideNotification } = useRecoilValue(dispatcherState);

  if (isEmpty(notifications)) return null;

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
};
