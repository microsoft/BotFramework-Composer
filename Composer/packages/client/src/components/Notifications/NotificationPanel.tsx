// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useCallback } from 'react';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { IPanelProps, Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';
import formatMessage from 'format-message';

import { Notification } from '../../recoilModel/types';
import { colors } from '../../colors';

import { NotificationCard } from './NotificationCard';

const styles = {
  container: css`
    display: flex;
    position: absolute;
    right: 0px;
    top: 18px;
  `,
  empty: css`
    color: ${colors.gray(130)};
    height: 100%;
    margin: 24px 0;
    text-align: center;
    width: 100%;
  `,
  panelButtons: css`
    display: flex;
    justify-content: center;
  `,
};

type NotificationPanelProps = {
  isOpen: boolean;
  notifications: Notification[];
  onDismiss: (event?: React.SyntheticEvent<HTMLElement, Event>) => void;
  onDeleteNotification: (id: string) => void;
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  notifications,
  onDeleteNotification,
  onDismiss,
}) => {
  const handleClearAll = useCallback(() => {
    notifications.map(({ id }) => onDeleteNotification(id));
  }, [onDeleteNotification, notifications]);

  const onRenderNavigationContent: IRenderFunction<IPanelProps> = useCallback(
    (props, defaultRender) => (
      <div css={styles.container}>
        <ActionButton styles={{ root: { color: colors.blue } }} onClick={handleClearAll}>
          {formatMessage('Clear all')}
        </ActionButton>
        {defaultRender!(props)}
      </div>
    ),
    [handleClearAll]
  );

  return (
    <Panel
      isLightDismiss
      closeButtonAriaLabel={formatMessage('Close')}
      customWidth={'390px'}
      headerText={formatMessage('Notifications')}
      isBlocking={false}
      isOpen={isOpen}
      styles={{
        root: {
          marginTop: '50px',
        },
        navigation: {
          height: '24px',
        },
        content: {
          marginTop: '24px',
        },
      }}
      type={PanelType.custom}
      onDismiss={onDismiss}
      onRenderNavigationContent={onRenderNavigationContent}
    >
      {notifications.length ? (
        <div>
          {notifications.map(({ hidden, id, retentionTime, ...cardProps }) => {
            return <NotificationCard key={id} cardProps={cardProps} id={id} onDismiss={onDeleteNotification} />;
          })}
        </div>
      ) : (
        <div css={styles.empty}>{formatMessage('There are no notifications.')}</div>
      )}
    </Panel>
  );
};

export { NotificationPanel };
