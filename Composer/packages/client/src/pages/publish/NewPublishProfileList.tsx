// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import {
  DetailsList,
  CheckboxVisibility,
  SelectionMode,
  DetailsListLayoutMode,
} from 'office-ui-fabric-react/lib/DetailsList';
import { Icon, IIconProps } from 'office-ui-fabric-react/lib/Icon';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import moment from 'moment';
import { useMemo, useState } from 'react';
import formatMessage from 'format-message';
import { ActionButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { FluentTheme, SharedColors } from '@uifabric/fluent-theme';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';

import { ApiStatus } from '../../utils/publishStatusPollingUpdater';

const editProfileIcon: IIconProps = { iconName: 'Edit' };
const deleteProfileIcon: IIconProps = { iconName: 'Delete' };

type PublishProfileListItem = {
  name: string;
  description: string;
  status?: number;
  message?: string;
  time?: string;
  hasLog?: boolean;
  onViewLog?: (name: string) => void;
  hasHistory?: boolean;
  onViewHistory?: (name: string) => void;
};

type Props = {
  items: PublishProfileListItem[];
  onAddNewProfile?: () => void;
};

export const NewPublishProfileList: React.FC<Props> = ({ items, onAddNewProfile }) => {
  const [currentSort, setSort] = useState({ key: 'publishTime', descending: true });

  const sortedItems = useMemo(() => {
    if (currentSort.descending) return items;
    return items.slice().reverse();
  }, [items, currentSort]);

  const renderStatus = (status?: ApiStatus, message?: string): JSX.Element | null => {
    if (!status) {
      return (
        <Stack horizontal gap={10} verticalAlign="center">
          <Icon iconName="Info" style={{ color: SharedColors.gray30, fontWeight: 600 }} />
          <span>{formatMessage('Ready for publishing')}</span>
        </Stack>
      );
    } else if (status === ApiStatus.Success) {
      return (
        <Stack horizontal gap={10} verticalAlign="center">
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
        <Stack horizontal gap={10} verticalAlign="center">
          <Icon iconName="Cancel" style={{ color: SharedColors.red10, fontWeight: 600 }} />
          <span>{message}</span>
        </Stack>
      );
    }
  };

  const columns = [
    {
      key: 'profileName',
      name: formatMessage('Publishing Profile'),
      className: 'profile-name',
      fieldName: 'name',
      isRowHeader: true,
      data: 'string',
      minWidth: 150,
      maxWidth: 150,
      isPadded: true,
      onRender: (item) => {
        return (
          <Stack>
            <Text style={{ fontSize: FluentTheme.fonts.medium.fontSize }}>{item.name}</Text>
            <Text style={{ fontSize: FluentTheme.fonts.small.fontSize, color: SharedColors.gray30 }}>
              {item.description}
            </Text>
          </Stack>
        );
      },
    },
    {
      key: 'editAction',
      name: '',
      minWidth: 24,
      maxWidth: 24,
      onRender: () => {
        return <IconButton className="edit-profile-action" iconProps={editProfileIcon} title={formatMessage('Edit')} />;
      },
      isPadded: true,
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
      isPadded: true,
    },
    {
      key: 'publishStatus',
      name: formatMessage('Status'),
      className: 'profile-publish-status',
      minWidth: 114,
      maxWidth: 134,
      data: 'string',
      onRender: (item) => {
        return renderStatus(item.status, item.message);
      },
      isPadded: true,
    },
    {
      key: 'publishTime',
      name: formatMessage('Publish Time'),
      className: 'profile-publish-datetime',
      fieldName: 'time',
      minWidth: 150,
      maxWidth: 150,
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
      key: 'view-log',
      name: '',
      minWidth: 70,
      maxWidth: 90,
      isCollapsible: true,
      data: 'string',
      onRender: (item: PublishProfileListItem) => {
        if (item.hasLog) {
          return (
            <ActionButton
              allowDisabledFocus
              styles={{ root: { color: '#0078D4' } }}
              onClick={() => {
                item.onViewLog && item.onViewLog(item.name);
              }}
            >
              {formatMessage('View log')}
            </ActionButton>
          );
        }
        return null;
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
      data: 'string',
      onRender: (item: PublishProfileListItem) => {
        if (item.hasHistory) {
          return (
            <ActionButton
              allowDisabledFocus
              styles={{ root: { color: '#0078D4' } }}
              onClick={() => {
                item.onViewHistory && item.onViewHistory(item.name);
              }}
            >
              {formatMessage('View history')}
            </ActionButton>
          );
        }
        return null;
      },
      isPadded: true,
    },
  ];

  return (
    <Stack>
      <DetailsList
        isHeaderVisible
        checkboxVisibility={CheckboxVisibility.always}
        columns={columns.map((col) => ({
          ...col,
          isSorted: col.key === currentSort.key,
          isSortedDescending: currentSort.descending,
        }))}
        items={sortedItems}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.single}
        styles={{
          root: {
            selectors: {
              '.ms-DetailsRow-check': { verticalAlign: 'middle', height: '100%' },
              '.ms-DetailsRow-fields': { display: 'flex', alignItems: 'center' },
            },
          },
        }}
        onColumnHeaderClick={(_, clickedCol) => {
          if (!clickedCol) return;
          if (clickedCol.key === currentSort.key) {
            clickedCol.isSortedDescending = !currentSort.descending;
            setSort({ key: clickedCol.key, descending: !currentSort.descending });
          } else {
            clickedCol.isSorted = false;
          }
        }}
      />
      {onAddNewProfile && (
        <ActionButton
          allowDisabledFocus
          styles={{ root: { color: '#0078D4' } }}
          onClick={() => {
            onAddNewProfile?.();
          }}
        >
          {formatMessage('Add new')}
        </ActionButton>
      )}
    </Stack>
  );
};
