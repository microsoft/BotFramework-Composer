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

import { IStatus, PublishStatusList } from './publishStatusList';

// Licensed under the MIT License.
export interface IBotStatus {
  id: string;
  name: string;
  publishTargets: any[];
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
  const renderItem = (item: IBotStatus) => {
    const publishTargetOptions = (): IDropdownOption[] => {
      const options: IDropdownOption[] = [];
      item.publishTargets.forEach((target) => {
        options.push({
          key: target.name,
          text: target.name,
        });
      });
      return options;
    };
    const publishStatusList = item.publishTarget
      ? botPublishHistoryList.find((list) => list.projectId === item.id)?.publishHistory[item.publishTarget]
      : [];
    const changeSelected = (_, isChecked) => {
      let newSelectedBots: IBotStatus[];
      if (isChecked) {
        newSelectedBots = selectedBots.concat(item);
      } else {
        newSelectedBots = selectedBots.filter((bot) => bot.id !== item.id);
      }
      setSelectedBots(newSelectedBots);
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
    return (
      <Fragment>
        <tr>
          <td>
            <Checkbox label={item.name} onChange={changeSelected} />
          </td>
          <td>
            <Dropdown options={publishTargetOptions()} />
          </td>
          <td>
            <span>{moment(item.time).format('MM-DD-YYYY')}</span>
          </td>
          <td>{renderStatus(item)}</td>
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
          <td colSpan={7}>
            <div css={{ display: showHistoryBots.includes(item.id) && item.publishTarget ? 'block' : 'none' }}>
              <PublishStatusList
                items={publishStatusList}
                updateItems={updatePublishHistory}
                onLogClick={onLogClick}
                onRollbackClick={onRollbackClick}
              />
              {publishStatusList.length === 0 ? (
                <div style={{ marginLeft: '50px', fontSize: 'smaller', marginTop: '20px' }}>No publish history</div>
              ) : null}
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
        <tbody>{items.map((item) => renderItem(item))}</tbody>
      </table>
    </Fragment>
  );
};
