// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Selection, SelectionMode } from 'office-ui-fabric-react/lib/Selection';
import { DetailsList, CheckboxVisibility, DetailsListLayoutMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Icon, IIconProps } from 'office-ui-fabric-react/lib/Icon';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import moment from 'moment';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import formatMessage from 'format-message';
import { ActionButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { FluentTheme, SharedColors } from '@uifabric/fluent-theme';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';

import { ApiStatus } from '../../utils/publishStatusPollingUpdater';

const editProfileIcon: IIconProps = { iconName: 'Edit' };
const deleteProfileIcon: IIconProps = { iconName: 'Delete' };

const selectionMode = SelectionMode.single;

type PublishProfileListItem = {
  name: string;
  description: string;
  status?: number;
  message?: string;
  time?: string;
  hasLog?: boolean;
  onViewLog?: (name: string) => void;
  hasHistory?: boolean;
};

type Props = {
  items: PublishProfileListItem[];
  selectedProfile?: string;
  onSelectedProfileChanged: (name?: string) => void;
  onAddNewProfile: () => void;
  onEditProfile: (name: string) => void;
  onDeleteProfile: (name: string) => void;
  renderHistory?: (name: string) => React.ReactNode;
};

export const NewPublishProfileList: React.FC<Props> = ({
  items,
  onSelectedProfileChanged,
  onAddNewProfile,
  onEditProfile,
  onDeleteProfile,
  renderHistory,
}) => {
  const [listItems, setListItems] = useState(items);
  const [currentSort, setSort] = useState({ key: 'publishTime', descending: true });
  const [showHistoryIds, setShowHistoryIds] = useState<string[]>([]);

  useEffect(() => {
    console.log('NewPublishBotList mounted');
  }, []);

  useEffect(() => {
    console.log(`selectedProfile ${selectedProfile}`);
  }, [selectedProfile]);

  const selection = useRef(
    new Selection({
      getKey: (item) => item.name,
      onSelectionChanged: () => {
        const currentSelection = selection.current.getSelection();
        const newSelectedProfile = currentSelection?.length ? currentSelection[0] : undefined;
        console.log(`onSelectionChanged ${newSelectedProfile?.name}`);
        if (newSelectedProfile) {
          onSelectedProfileChanged(newSelectedProfile?.name);
        }
      },
    })
  );

  // Fluent DetailsList will not re-render when state outside of the items array changes
  // When data outside the items chagnes, the list items need to be force changed.
  useEffect(() => {
    if (currentSort.descending) {
      setListItems([...items]);
    } else {
      setListItems([...items].reverse);
    }
  }, [items, currentSort]);

  const toggleShowHistory = (name: string) => {
    if (!showHistoryIds.includes(name)) {
      setShowHistoryIds([...showHistoryIds, name]);
    } else {
      setShowHistoryIds(showHistoryIds.filter((historyId) => historyId !== name));
    }
  };

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
        <Stack horizontal gap={10} verticalAlign="center">
          <Spinner size={SpinnerSize.small} />
          <span>{message}</span>
        </Stack>
      );
    } else {
      return (
        <Stack horizontal gap={10} verticalAlign="center">
          <Icon iconName="ErrorBadge" style={{ color: SharedColors.red10, fontWeight: 600 }} />
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
      minWidth: 250,
      maxWidth: 250,
      isMultiline: true,
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
      onRender: (item) => {
        return (
          <IconButton
            className="edit-profile-action"
            iconProps={editProfileIcon}
            title={formatMessage('Edit')}
            onClick={() => onEditProfile(item.name)}
          />
        );
      },
      isPadded: true,
    },
    {
      key: 'deleteAction',
      name: '',
      minWidth: 24,
      maxWidth: 24,
      onRender: (item) => {
        return (
          <IconButton
            className="delete-profile-action"
            iconProps={deleteProfileIcon}
            title={formatMessage('Delete')}
            onClick={() => onDeleteProfile(item.name)}
          />
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
      key: 'view-Log',
      name: 'Log',
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
      key: 'viewHistory',
      name: 'History',
      className: 'profile-publish-log',
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
                toggleShowHistory(item.name);
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

  const renderRow = (props, defaultRender) => {
    const { item }: { item: PublishProfileListItem } = props;
    const showHistory = item.hasHistory && showHistoryIds.includes(item.name);
    return (
      <Fragment>
        {defaultRender(props)}
        {showHistory && renderHistory && renderHistory(item.name)}
      </Fragment>
    );
  };

  return (
    <Stack>
      <DetailsList
        isHeaderVisible
        selectionPreservedOnEmptyClick
        checkboxVisibility={CheckboxVisibility.always}
        columns={columns.map((col) => ({
          ...col,
          isSorted: col.key === currentSort.key,
          isSortedDescending: currentSort.descending,
        }))}
        items={listItems}
        layoutMode={DetailsListLayoutMode.justified}
        selection={selection.current}
        selectionMode={selectionMode}
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
        onRenderRow={renderRow}
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
