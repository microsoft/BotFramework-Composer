// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import moment from 'moment';
import formatMessage from 'format-message';
import { Icon, IIconProps } from 'office-ui-fabric-react/lib/Icon';
import React, { useMemo } from 'react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { PublishResult, PublishTarget } from '@bfc/shared';
import { DetailsList, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { SharedColors } from '@uifabric/fluent-theme';
import { ActionButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { Stack } from 'office-ui-fabric-react/lib/Stack';

import { ApiStatus } from '../../utils/publishStatusPollingUpdater';

import { BotStatus } from './type';

const editProfileIcon: IIconProps = { iconName: 'Edit' };
const deleteProfileIcon: IIconProps = { iconName: 'Delete' };

type PublishProfileListItem = {
  publishTarget: PublishTarget;
  publishHistory: PublishResult[];
};

type Props = {
  items: PublishProfileListItem[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewLog?: (id: string) => void;
};

export const PublishProfileList: React.FC<Props> = ({ items }) => {
  const listItems = useMemo(() => {
    return items.map((item) => {
      const { publishTarget, publishHistory } = item;
      const lastHistoryItem = publishHistory?.length ? publishHistory[0] : undefined;

      return {
        ...publishTarget,
        status: lastHistoryItem ? lastHistoryItem.status : '',
        message: lastHistoryItem ? lastHistoryItem.message : '',
        time: lastHistoryItem ? lastHistoryItem.time : '',
        log: lastHistoryItem ? lastHistoryItem.log : '',
      };
    });
  }, [items]);

  const renderStatus = (status?: ApiStatus, message?: string): JSX.Element | null => {
    if (!status) {
      return null;
    } else if (status === ApiStatus.Success) {
      return (
        <Stack horizontal gap={5} verticalAlign="center">
          <Icon iconName="Accept" style={{ color: SharedColors.green10, fontWeight: 600 }} />
          <span>{message}</span>
        </Stack>
      );
    } else if (status === ApiStatus.Publishing) {
      return (
        <div style={{ display: 'flex' }}>
          <Spinner size={SpinnerSize.small} />
        </div>
      );
    } else {
      return (
        <Stack horizontal gap={5} verticalAlign="center">
          <Icon iconName="Cancel" style={{ color: SharedColors.red10, fontWeight: 600 }} />
          <span>{message}</span>
        </Stack>
      );
    }
  };

  const columns: IColumn[] = [
    {
      key: 'name',
      name: formatMessage('Publishing Profile'),
      className: 'profile-name',
      fieldName: 'name',
      isRowHeader: true,
      data: 'string',
      minWidth: 150,
      maxWidth: 150,
    },
    {
      key: 'editAction',
      name: '',
      minWidth: 24,
      maxWidth: 24,
      onRender: () => {
        return <IconButton className="edit-profile-action" iconProps={editProfileIcon} title={formatMessage('Edit')} />;
      },
    },
    {
      key: 'deleteAction',
      name: '',
      minWidth: 24,
      maxWidth: 24,
      onRender: () => {
        return (
          <IconButton className="delete-profile-action" iconProps={deleteProfileIcon} title={formatMessage('Delete')} />
        );
      },
    },
    {
      key: 'datetime',
      name: formatMessage('Publish Time'),
      className: 'profile-publish-datetime',
      fieldName: 'time',
      minWidth: 150,
      maxWidth: 150,
      isRowHeader: true,
      data: 'string',
      onRender: (item) => {
        return (
          item.time && (
            <span>
              {moment(item.time).format('MM-DD-YYYY')} {moment(item.time).format('h:mm a')}
            </span>
          )
        );
      },
      isPadded: true,
    },
    {
      key: 'status',
      name: formatMessage('Status'),
      className: 'profile-publish-status',
      minWidth: 114,
      maxWidth: 134,
      isRowHeader: true,
      data: 'string',
      onRender: (item) => {
        return renderStatus(item.status, item.message);
      },
      isPadded: true,
    },
    {
      key: 'log',
      name: '',
      className: 'profile-publish-log',
      fieldName: 'log',
      minWidth: 70,
      maxWidth: 90,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      onRender: () => {
        return (
          <ActionButton
            allowDisabledFocus
            styles={{ root: { color: '#0078D4' } }}
            onClick={() => {
              //setDisplayedLog(item.log || '');
            }}
          >
            {formatMessage('View log')}
          </ActionButton>
        );
      },
      isPadded: true,
    },
  ];

  return (
    <DetailsList
      columns={columns}
      items={listItems}
      styles={{ root: { selectors: { '.ms-DetailsRow-fields': { display: 'flex', alignItems: 'center' } } } }}
    />
  );
};
