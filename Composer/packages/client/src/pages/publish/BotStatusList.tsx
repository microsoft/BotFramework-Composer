// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import moment from 'moment';
import formatMessage from 'format-message';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import React, { useState, Fragment, useMemo } from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { PublishResult } from '@bfc/shared';
import { CheckboxVisibility, DetailsList, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { SharedColors } from '@uifabric/fluent-theme';
import { FontSizes } from '@uifabric/styling';

import { ApiStatus } from '../../utils/publishStatusPollingUpdater';

import { PublishStatusList } from './PublishStatusList';
import { detailList, listRoot, tableView } from './styles';
import { Bot, BotPublishHistory, BotPropertyType, BotStatus } from './type';

export interface BotStatusListProps {
  botList: Bot[];
  botPropertyData: BotPropertyType;
  botPublishHistoryList: BotPublishHistory;
  publishDisabled: boolean;
  managePublishProfile: (skillId: string) => void;
  updateItems: (items: BotStatus[]) => void;
  updateSelectedBots: (items: BotStatus[]) => void;
  changePublishTarget: (PublishTarget: string, item: BotStatus) => void;
  onRollbackClick: (selectedVersion: PublishResult, item: BotStatus) => void;
}

const generateBotList = (
  botList: Bot[],
  botPropertyData: BotPropertyType,
  botPublishHistoryList: BotPublishHistory
): BotStatus[] => {
  const bots = botList.map((bot) => {
    const botStatus: BotStatus = Object.assign({}, bot);
    const publishTargets = botPropertyData[bot.id].publishTargets;
    const publishHistory = botPublishHistoryList[bot.id];
    if (publishTargets.length > 0 && botStatus.publishTarget && publishHistory) {
      botStatus.publishTargets = publishTargets;
      if (publishHistory[botStatus.publishTarget] && publishHistory[botStatus.publishTarget].length > 0) {
        const history = publishHistory[botStatus.publishTarget][0];
        botStatus.time = history.time;
        botStatus.comment = history.comment;
        botStatus.message = history.message;
        botStatus.status = history.status;
      }
    }
    return botStatus;
  });
  return bots;
};

export const BotStatusList: React.FC<BotStatusListProps> = ({
  botList,
  botPropertyData,
  botPublishHistoryList,
  publishDisabled,
  managePublishProfile,
  updateItems,
  changePublishTarget,
  updateSelectedBots,
  onRollbackClick,
}) => {
  const [selectedBots, setSelectedBots] = useState<BotStatus[]>([]);
  const [showHistoryBots, setShowHistoryBots] = useState<string[]>([]);

  const [currentSort, setSort] = useState({ key: 'Bot', descending: true });
  const items: BotStatus[] = useMemo(() => {
    return generateBotList(botList, botPropertyData, botPublishHistoryList);
  }, [botList, botPropertyData, botPublishHistoryList]);
  const sortByName = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    if (column.isSorted) {
      column.isSortedDescending = !column.isSortedDescending;
      const newItems: BotStatus[] = items.reverse();
      updateItems(newItems);
    }
  };
  const changeSelected = (item: BotStatus, isChecked?: boolean) => {
    let newSelectedBots: BotStatus[];
    if (isChecked) {
      newSelectedBots = [...selectedBots, item];
    } else {
      newSelectedBots = selectedBots.filter((bot) => bot.id !== item.id);
    }
    setSelectedBots(newSelectedBots);
    updateSelectedBots(newSelectedBots);
  };

  const publishTargetOptions = (item: BotStatus): IDropdownOption[] => {
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
  const onRenderOption = (option?: IDropdownOption): JSX.Element | null => {
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
  const onRenderStatus = (item: BotStatus): JSX.Element | null => {
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
  const handleChangePublishTarget = (item: BotStatus, option?: IDropdownOption): void => {
    if (option) {
      if (option.key === 'manageProfiles') {
        managePublishProfile(item.id);
      } else {
        changePublishTarget(option.text, item);
      }
    }
  };
  const changeShowHistoryBots = (item: BotStatus) => {
    let newShowHistoryBots: string[];
    if (showHistoryBots.includes(item.id)) {
      newShowHistoryBots = showHistoryBots.filter((id) => id !== item.id);
    } else {
      newShowHistoryBots = [...showHistoryBots, item.id];
    }
    setShowHistoryBots(newShowHistoryBots);
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
      onColumnClick: sortByName,
      data: 'string',
      onRender: (item: BotStatus) => {
        return (
          <Checkbox
            disabled={publishDisabled}
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
            onChange={(_, isChecked) => changeSelected(item, isChecked)}
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
            options={publishTargetOptions(item)}
            placeholder={formatMessage('Select a publish target')}
            styles={{
              root: { width: '100%' },
              dropdownItems: { selectors: { '.ms-Button-flexContainer': { width: '100%' } } },
            }}
            onChange={(_, option?: IDropdownOption) => handleChangePublishTarget(item, option)}
            onRenderOption={onRenderOption}
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
        return onRenderStatus(item);
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
            iconProps={{ iconName: showHistoryBots.includes(item.id) ? 'ChevronDown' : 'ChevronRight' }}
            styles={{ root: { float: 'right' } }}
            onClick={() => changeShowHistoryBots(item)}
          />
        );
      },
      isPadded: true,
    },
  ];
  const onRenderRow = (props, defaultRender) => {
    const { item }: { item: BotStatus } = props;
    const publishStatusList: PublishResult[] = item.publishTarget
      ? botPublishHistoryList[item.id][item.publishTarget] || []
      : [];
    const target = item.publishTargets?.find((target) => target.name === item.publishTarget);
    const publishType = botPropertyData[item.id].publishTypes?.filter((t) => t.name === target?.type)[0];
    const isRollbackSupported = !!target && !!publishType?.features?.rollback;
    const handleRollbackClick = (selectedVersion) => {
      onRollbackClick(selectedVersion, item);
    };

    return (
      <Fragment>
        {defaultRender(props)}
        <div css={{ display: showHistoryBots.includes(item.id) ? 'block' : 'none', margin: '20px 0 38px 12px' }}>
          <div css={{ fontSize: '14px', lineHeight: '20px', color: '#323130', fontWeight: 'bold' }}>
            Publish history
          </div>
          {publishStatusList.length === 0 ? (
            <div style={{ fontSize: FontSizes.small, margin: '20px 0 0 50px' }}>No publish history</div>
          ) : (
            <PublishStatusList
              isRollbackSupported={isRollbackSupported}
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
          items={items}
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
          onRenderRow={onRenderRow}
        />
      </div>
    </div>
  );
};
