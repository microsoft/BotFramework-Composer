// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import isEmpty from 'lodash/isEmpty';
import { Layer } from 'office-ui-fabric-react/lib/Layer';
import { useRecoilValue } from 'recoil';

import { dispatcherState } from '../../recoilModel';
import { notificationsSelector } from '../../recoilModel/selectors/notifications';
import { zIndices } from '../../utils/zIndices';

import { NotificationCard } from './NotificationCard';

// -------------------- Styles -------------------- //

const container = css`
  cursor: default;
  top: 50px;
  height: calc(100vh - 50px);
  position: absolute;
  right: 0px;
  padding: 6px;
`;

const layerStyles = { root: { zIndex: zIndices.notificationContainer } };

// -------------------- NotificationContainer -------------------- //

export const NotificationContainer = () => {
  const notifications = useRecoilValue(notificationsSelector).filter(({ hidden }) => !hidden);
  const { deleteNotification, hideNotification } = useRecoilValue(dispatcherState);

  if (isEmpty(notifications)) return null;

  return (
    <Layer styles={layerStyles}>
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
    </Layer>
  );
};
