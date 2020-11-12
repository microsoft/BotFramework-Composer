// Copyright (c) Microsoft Corporation.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import moment from 'moment';
import formatMessage from 'format-message';
import { ActionButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { FontIcon, Icon } from 'office-ui-fabric-react/lib/Icon';
import React, { useState } from 'react';
import { Fragment } from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

import { navigateTo } from '../../utils/navigation';

import { IStatus, PublishStatusList } from './publishStatusList';

// Licensed under the MIT License.
export interface IBotStatus {
  id: string;
  name: string;
  publishTargets?: any[];
  publishTarget?: string;
  time?: string;
  status?: number;
  message?: string;
  comment?: string;
}
export interface IBotStatusListProps {
  items: IBotStatus[];
  botPublishHistoryList: { [key: string]: any }[];
  updatePublishHistory: (items: IStatus[], item: IBotStatus) => void;
  updateSelectedBots: (items: IBotStatus[]) => void;
  changePublishTarget: (PublishTarget: string, item: IBotStatus) => void;
  onLogClick: (item: IStatus | null) => void;
  onRollbackClick: (selectedVersion: IStatus | null, item: IBotStatus) => void;
}
export const BotStatusList: React.FC<IBotStatusListProps> = (props) => {
  const {
    items,
    botPublishHistoryList,
    updatePublishHistory,
    changePublishTarget,
    onLogClick,
    onRollbackClick,
  } = props;
  const [botDescend, setBotDescend] = useState(false);
  const sortBot = () => {
    setBotDescend(!botDescend);
  };

  const [selectedBots, setSelectedBots] = useState<IBotStatus[]>([]);
  const [showHistoryBots, setShowHistoryBots] = useState<string[]>([]);
  const renderStatus = (item: IBotStatus) => {
    if (item.status === 200) {
      return <Icon iconName="Accept" style={{ color: 'green', fontWeight: 600 }} />;
    } else if (item.status === 202) {
      return (
        <div style={{ display: 'flex' }}>
          <Spinner size={SpinnerSize.small} />
        </div>
      );
    } else {
      return <Icon iconName="Cancel" style={{ color: 'red', fontWeight: 600 }} />;
    }
  };
  const headerStyle = css({ padding: '0 32px 0 11px', fontWeight: 400 });
  const bodyStyle = css({ minWidth: '114px', maxWidth: '134px', padding: '11px 32px 11px 12px', textAlign: 'center' });
  const trStyle = css({ borderTop: '1px solid #EDEBE9' });
  const spanStyle = css({ wordBreak: 'break-word' });

  const RenderItem = (item: IBotStatus, index: number) => {
    const publishTargetOptions = (): IDropdownOption[] => {
      const options: IDropdownOption[] = [];
      item.publishTargets &&
        item.publishTargets.forEach((target) => {
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
    const onRenderOption = (option?: IDropdownOption): JSX.Element => {
      if (!option) return <div></div>;
      return <div style={option.data && option.data.style}>{option.text}</div>;
    };
    const publishStatusList = item.publishTarget
      ? botPublishHistoryList.find((list) => list.projectId === item.id)?.publishHistory[item.publishTarget] || []
      : [];
    const changeSelected = (_, isChecked) => {
      let newSelectedBots: IBotStatus[];
      if (isChecked) {
        newSelectedBots = selectedBots.concat(item);
      } else {
        newSelectedBots = selectedBots.filter((bot) => bot.id !== item.id);
      }
      setSelectedBots(newSelectedBots);
      props.updateSelectedBots(newSelectedBots);
    };
    const changeShowHistoryBots = (_) => {
      let newShowHistoryBots: string[];
      if (showHistoryBots.includes(item.id)) {
        newShowHistoryBots = showHistoryBots.filter((id) => id !== item.id);
      } else {
        newShowHistoryBots = showHistoryBots.concat(item.id);
      }
      setShowHistoryBots(newShowHistoryBots);
    };
    const hanldeUpdatePublishHistory = (publishHistories) => {
      updatePublishHistory(publishHistories, item);
    };
    const handleChangePublishTarget = (_, option?: IDropdownOption): void => {
      if (option) {
        if (option.key === 'manageProfiles') {
          navigateTo(`/bot/${item.id}/botProjectsSettings/root`);
          return;
        }
        changePublishTarget(option.text, item);
      }
    };
    const handleRollbackClick = (selectedVersion) => {
      onRollbackClick(selectedVersion, item);
    };
    return (
      <Fragment key={index}>
        <tr css={trStyle}>
          <td css={bodyStyle}>
            <Checkbox label={item.name} onChange={changeSelected} />
          </td>
          <td css={bodyStyle}>
            <Dropdown
              defaultSelectedKey={item.publishTarget}
              options={publishTargetOptions()}
              placeholder={formatMessage('Select a publish target')}
              styles={{ root: { width: '134px' } }}
              onChange={handleChangePublishTarget}
              onRenderOption={onRenderOption}
            />
          </td>
          <td css={bodyStyle}>
            <span>{item.time && moment(item.time).format('MM-DD-YYYY')}</span>
          </td>
          <td css={bodyStyle}>{item.status && renderStatus(item)}</td>
          <td css={bodyStyle}>
            <span css={spanStyle}>{item.message}</span>
          </td>
          <td css={bodyStyle}>
            <span css={spanStyle}>{item.comment}</span>
          </td>
          <td css={bodyStyle}>
            <IconButton
              iconProps={{ iconName: showHistoryBots.includes(item.id) ? 'ChevronDown' : 'ChevronRight' }}
              onClick={changeShowHistoryBots}
            />
          </td>
        </tr>
        <tr css={showHistoryBots.includes(item.id) ? trStyle : ''}>
          <td colSpan={8}>
            <div css={{ display: showHistoryBots.includes(item.id) ? 'block' : 'none' }}>
              <div css={{ fontSize: '14px', lineHeight: '20px', color: '#323130', fontWeight: 'bold' }}>
                Publish history
              </div>
              {publishStatusList.length === 0 ? (
                <div style={{ marginLeft: '50px', fontSize: 'smaller', marginTop: '20px' }}>No publish history</div>
              ) : (
                <PublishStatusList
                  items={publishStatusList}
                  updateItems={hanldeUpdatePublishHistory}
                  onLogClick={onLogClick}
                  onRollbackClick={handleRollbackClick}
                />
              )}
            </div>
          </td>
        </tr>
      </Fragment>
    );
  };

  const tableStyle = css({
    height: '100%',
    overflow: 'auto',
    borderCollapse: 'collapse',
    display: 'inline-block',
  });
  return (
    <Fragment>
      <table css={tableStyle}>
        <thead>
          <tr>
            <th css={headerStyle}>
              <ActionButton onClick={sortBot}>
                {formatMessage('Bot')}
                <FontIcon iconName={botDescend ? 'Down' : 'Up'} />
              </ActionButton>
            </th>
            <th css={headerStyle}>{formatMessage('Publish target')}</th>
            <th css={headerStyle}>{formatMessage('Date')}</th>
            <th css={headerStyle}>{formatMessage('Status')}</th>
            <th css={headerStyle}>{formatMessage('Message')}</th>
            <th css={headerStyle}>{formatMessage('Comment')}</th>
          </tr>
        </thead>
        <tbody>{items.map((item, index) => RenderItem(item, index))}</tbody>
      </table>
    </Fragment>
  );
};
