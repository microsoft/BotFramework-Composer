// Copyright (c) Microsoft Corporation.

/** @jsx jsx */
import { jsx } from '@emotion/core';
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
  updatePublishHistory: (items: IStatus[]) => void;
  updateSelectedBots: (items: IBotStatus[]) => void;
  onLogClick: (item: IStatus | null) => void;
  onRollbackClick: (item: IStatus | null) => void;
}
export const BotStatusList: React.FC<IBotStatusListProps> = (props) => {
  const { items, botPublishHistoryList, updatePublishHistory, onLogClick, onRollbackClick } = props;
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
  const renderItem = (item: IBotStatus, index: number) => {
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
      props.updateSelectedBots(selectedBots);
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
    const changePublishTarget = (_, option?: IDropdownOption): void => {
      if (option && option.key === 'manageProfiles') {
        navigateTo(`/bot/${item.id}/botProjectsSettings/root`);
      }
    };
    return (
      <Fragment key={index}>
        <tr>
          <td>
            <Checkbox onChange={changeSelected} />
          </td>
          <td>{item.name}</td>
          <td>
            <Dropdown
              options={publishTargetOptions()}
              placeHolder={formatMessage('Select a publish target')}
              onChange={changePublishTarget}
              onRenderOption={onRenderOption}
            />
          </td>
          <td>
            <span>{item.time && moment(item.time).format('MM-DD-YYYY')}</span>
          </td>
          <td>{item.status && renderStatus(item)}</td>
          <td>
            <span>{item.message}</span>
          </td>
          <td>
            <span>{item.comment}</span>
          </td>
          <td>
            <IconButton
              iconProps={{ iconName: showHistoryBots.includes(item.id) ? 'ChevronDown' : 'ChevronRight' }}
              onClick={changeShowHistoryBots}
            />
          </td>
        </tr>
        <tr>
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
                  updateItems={updatePublishHistory}
                  onLogClick={onLogClick}
                  onRollbackClick={onRollbackClick}
                />
              )}
            </div>
          </td>
        </tr>
      </Fragment>
    );
  };
  return (
    <Fragment>
      <table>
        <thead>
          <tr>
            <td></td>
            <td>
              <ActionButton onClick={sortBot}>
                {formatMessage('Bot')}
                <FontIcon iconName={botDescend ? 'Down' : 'Up'} />
              </ActionButton>
            </td>
            <td>{formatMessage('Publish target')}</td>
            <td>{formatMessage('Date')}</td>
            <td>{formatMessage('Status')}</td>
            <td>{formatMessage('Message')}</td>
            <td>{formatMessage('Comment')}</td>
          </tr>
        </thead>
        <tbody>{items.map((item, index) => renderItem(item, index))}</tbody>
      </table>
    </Fragment>
  );
};
