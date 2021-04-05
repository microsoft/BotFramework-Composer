// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import moment from 'moment';
import formatMessage from 'format-message';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import React, { useState, Fragment, useMemo, useRef } from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { PublishResult } from '@bfc/shared';
import { CheckboxVisibility, DetailsList } from 'office-ui-fabric-react/lib/DetailsList';
import { ActionButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { SharedColors } from '@uifabric/fluent-theme';
import { FontSizes } from '@uifabric/styling';
import get from 'lodash/get';
import { ITextField, TextField } from 'office-ui-fabric-react/lib/TextField';

import { ApiStatus } from '../../utils/publishStatusPollingUpdater';

import { PublishStatusList } from './PublishStatusList';
import { detailList, listRoot, tableView } from './styles';
import { BotPublishHistory, BotStatus } from './type';

export type BotStatusListProps = {
  botStatusList: BotStatus[];
  botPublishHistoryList: BotPublishHistory;

  /** When set to true, disable the checkbox. */
  disableCheckbox: boolean;
  onManagePublishProfile: (skillId: string) => void;
  checkedIds: string[];
  onCheck: (skillIds: string[]) => void;
  onChangePublishTarget: (PublishTarget: string, item: BotStatus) => void;
  onRollbackClick: (selectedVersion: PublishResult, item: BotStatus) => void;
};

export const BotStatusList: React.FC<BotStatusListProps> = ({
  botStatusList,
  botPublishHistoryList,
  disableCheckbox,
  checkedIds,
  onCheck,
  onManagePublishProfile,
  onChangePublishTarget,
  onRollbackClick,
}) => {
  const [expandedBotIds, setExpandedBotIds] = useState<Record<string, boolean>>({});
  const [currentSort, setSort] = useState({ key: 'Bot', descending: true });
  const [clipboardText, setClipboardText] = useState('');
  const clipboardTextFieldRef = useRef<ITextField>(null);

  const copyStringToClipboard = (value?: string) => {
    try {
      if (clipboardTextFieldRef.current) {
        setClipboardText(value || '');
        setTimeout(() => {
          if (clipboardTextFieldRef.current) {
            clipboardTextFieldRef.current.select();
            document.execCommand('copy');
          }
        }, 10);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Something went wrong when copying to the clipboard.', e, location);
    }
  };

  const displayedItems: BotStatus[] = useMemo(() => {
    if (currentSort.key !== 'Bot') return botStatusList;
    if (currentSort.descending) return botStatusList;
    return botStatusList.slice().reverse();
  }, [botStatusList, currentSort]);

  const getPublishTargetOptions = (item: BotStatus): IDropdownOption[] => {
    const options: IDropdownOption[] = [];
    item.publishTargets &&
      item.publishTargets.forEach((target, index) => {
        options.push({
          key: target.name,
          text: target.name,
        });
      });
    options.push({
      key: 'manageProfiles',
      text: formatMessage('Manage profiles'),
      data: { style: { color: '#0078D4' } },
    });
    return options;
  };

  const onChangeCheckbox = (skillId: string, isChecked?: boolean) => {
    if (isChecked) {
      if (checkedIds.some((id) => id === skillId)) return;
      onCheck([...checkedIds, skillId]);
    } else {
      onCheck(checkedIds.filter((id) => id !== skillId));
    }
  };

  const handleChangePublishTarget = (item: BotStatus, option?: IDropdownOption): void => {
    if (option) {
      if (option.key === 'manageProfiles') {
        onManagePublishProfile(item.id);
      } else {
        onChangePublishTarget(option.text, item);
      }
    }
  };

  const onChangeShowHistoryBots = (item: BotStatus) => {
    const clickedBotId = item.id;
    if (expandedBotIds[clickedBotId]) {
      setExpandedBotIds({ ...expandedBotIds, [clickedBotId]: false });
    } else {
      setExpandedBotIds({ ...expandedBotIds, [clickedBotId]: true });
    }
  };

  const renderDropdownOption = (option?: IDropdownOption): JSX.Element | null => {
    if (!option) return null;
    const style = {
      ...option.data?.style,
      width: '80%',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    };
    return <div style={style}>{option.text}</div>;
  };

  const renderPublishStatus = (item: BotStatus): JSX.Element | null => {
    if (!item.status) {
      return null;
    } else if (item.status === ApiStatus.Success) {
      return <Icon iconName="Accept" style={{ color: SharedColors.green10, fontWeight: 600 }} />;
    } else if (item.status === ApiStatus.Publishing) {
      return (
        <div style={{ display: 'flex' }}>
          <Spinner size={SpinnerSize.small} />
        </div>
      );
    } else {
      return <Icon iconName="Cancel" style={{ color: SharedColors.red10, fontWeight: 600 }} />;
    }
  };

  const columns = [
    {
      key: 'Bot',
      name: formatMessage('Bot'),
      className: 'publishName',
      fieldName: 'name',
      minWidth: 100,
      maxWidth: 200,
      isRowHeader: true,
      data: 'string',
      onRender: (item: BotStatus) => {
        return (
          <Checkbox
            disabled={disableCheckbox}
            label={item.name}
            styles={{
              label: { width: '100%' },
              text: {
                width: 'calc(100% - 25px)',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              },
            }}
            onChange={(_, isChecked) => onChangeCheckbox(item.id, isChecked)}
          />
        );
      },
      isPadded: true,
    },
    {
      key: 'PublishTarget',
      name: formatMessage('Publish target'),
      className: 'publishTarget',
      fieldName: 'target',
      minWidth: 100,
      maxWidth: 200,
      isRowHeader: true,
      data: 'string',
      onRender: (item: BotStatus) => {
        return (
          <Dropdown
            defaultSelectedKey={item.publishTarget}
            options={getPublishTargetOptions(item)}
            placeholder={formatMessage('Select a publish target')}
            styles={{
              root: { width: '100%' },
              dropdownItems: { selectors: { '.ms-Button-flexContainer': { width: '100%' } } },
            }}
            onChange={(_, option?: IDropdownOption) => handleChangePublishTarget(item, option)}
            onRenderOption={renderDropdownOption}
          />
        );
      },
      isPadded: true,
    },
    {
      key: 'PublishDate',
      name: formatMessage('Date'),
      className: 'publishDate',
      fieldName: 'date',
      minWidth: 114,
      maxWidth: 134,
      isRowHeader: true,
      data: 'string',
      onRender: (item: BotStatus) => {
        return <span>{item.time ? moment(item.time).format('MM-DD-YYYY') : null}</span>;
      },
      isPadded: true,
    },
    {
      key: 'PublishStatus',
      name: formatMessage('Status'),
      className: 'publishStatus',
      fieldName: 'status',
      minWidth: 114,
      maxWidth: 134,
      isRowHeader: true,
      data: 'string',
      onRender: (item: BotStatus) => {
        return renderPublishStatus(item);
      },
      isPadded: true,
    },
    {
      key: 'PublishMessage',
      name: formatMessage('Message'),
      className: 'publishMessage',
      fieldName: 'message',
      minWidth: 150,
      maxWidth: 300,
      isRowHeader: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      onRender: (item: BotStatus) => {
        return <span>{item.message}</span>;
      },
      isPadded: true,
    },
    {
      key: 'PublishComment',
      name: formatMessage('Comment'),
      className: 'comment',
      fieldName: 'comment',
      minWidth: 150,
      maxWidth: 300,
      isRowHeader: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      onRender: (item: BotStatus) => {
        return <span>{item.comment}</span>;
      },
      isPadded: true,
    },
    {
      key: 'SkillManifest',
      name: '',
      className: 'skillManifest',
      fieldName: 'skillManifestUrl',
      minWidth: 114,
      maxWidth: 134,
      data: 'string',
      onRender: (item: BotStatus) => {
        return (
          item?.skillManifestUrl && (
            <ActionButton
              title={item.skillManifestUrl}
              onClick={() => {
                copyStringToClipboard(item.skillManifestUrl);
              }}
            >
              {formatMessage('Copy Skill Manifest URL')}
            </ActionButton>
          )
        );
      },
      isPadded: true,
    },
    {
      key: 'ShowPublishHistory',
      name: '',
      className: 'showHistory',
      fieldName: 'showHistory',
      minWidth: 150,
      maxWidth: 300,
      isRowHeader: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      onRender: (item: BotStatus) => {
        return (
          <IconButton
            iconProps={{ iconName: expandedBotIds[item.id] ? 'ChevronDown' : 'ChevronRight' }}
            styles={{ root: { float: 'right' } }}
            onClick={() => onChangeShowHistoryBots(item)}
          />
        );
      },
      isPadded: true,
    },
  ];

  const renderTableRow = (props, defaultRender) => {
    const { item }: { item: BotStatus } = props;
    const publishStatusList: PublishResult[] = get(botPublishHistoryList, [item.id, item.publishTarget || ''], []);
    const handleRollbackClick = (selectedVersion) => {
      onRollbackClick(selectedVersion, item);
    };
    return (
      <Fragment>
        {defaultRender(props)}
        <div css={{ display: expandedBotIds[item.id] ? 'block' : 'none', margin: '20px 0 38px 12px' }}>
          <div css={{ fontSize: '14px', lineHeight: '20px', color: '#323130', fontWeight: 'bold' }}>
            Publish history
          </div>
          {publishStatusList.length === 0 ? (
            <div style={{ fontSize: FontSizes.small, margin: '20px 0 0 50px' }}>No publish history</div>
          ) : (
            <PublishStatusList
              isRollbackSupported={false}
              items={publishStatusList}
              onRollbackClick={handleRollbackClick}
            />
          )}
        </div>
      </Fragment>
    );
  };

  return (
    <div css={listRoot} data-testid={'bot-status-list'}>
      <div css={tableView}>
        <DetailsList
          isHeaderVisible
          checkboxVisibility={CheckboxVisibility.hidden}
          columns={columns.map((col) => ({
            ...col,
            isSorted: col.key === currentSort.key,
            isSortedDescending: currentSort.descending,
          }))}
          css={detailList}
          items={displayedItems}
          styles={{ root: { selectors: { '.ms-DetailsRow-fields': { display: 'flex', alignItems: 'center' } } } }}
          onColumnHeaderClick={(_, clickedCol) => {
            if (!clickedCol) return;
            if (clickedCol.key === currentSort.key) {
              clickedCol.isSortedDescending = !currentSort.descending;
              setSort({ key: clickedCol.key, descending: !currentSort.descending });
            } else {
              clickedCol.isSorted = false;
            }
          }}
          onRenderRow={renderTableRow}
        />
      </div>
      <TextField
        readOnly
        componentRef={clipboardTextFieldRef}
        styles={{ root: { display: 'none' } }}
        value={clipboardText}
      />
    </div>
  );
};
