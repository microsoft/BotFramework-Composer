// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { CardProps } from '../../components/Notifications/NotificationCard';
import { colors } from '../../colors';

import { IBotStatus } from './BotStatusList';

const cardContent = css`
  display: flex;
  padding: 0 16px 16px 12px;
  min-height: 64px;
  align-items: center;
`;

const cardDetail = css`
  margin-left: 8px;
  flex-grow: 1;
`;

const infoType = css`
  margin-top: 4px;
  color: ${colors.blue};
`;

const cardDescription = css`
  text-size-adjust: none;
  font-size: 12px;
  line-height: 16px;
  margin-right: 16px;
  word-break: break-word;
`;

export const getPublishedNotificationCardProps = (item: IBotStatus): CardProps => {
  const statusIconStyle = css({
    margin: '12px 0 0 -1px',
    width: '12px',
    height: '12px',
    fontSize: '12px',
    color: item.status === 200 ? colors.green : colors.gray(90),
    transform: item.status !== 200 ? 'rotate(45deg)' : '',
  });
  return {
    title: '',
    description:
      item.status === 200
        ? formatMessage(`You have successfully published {name} to {publishTarget}`, {
            name: item.name,
            publishTarget: item.publishTarget,
          })
        : formatMessage(`Publishing {name} to {publishTarget} failed.`, {
            name: item.name,
            publishTarget: item.publishTarget,
          }),
    type: 'pending',
    onRenderCardContent: (props) => (
      <div css={cardContent}>
        <Icon css={infoType} iconName="CloudUpload" />
        <Icon css={statusIconStyle} iconName={item.status === 200 ? 'SkypeCircleCheck' : 'CircleAdditionSolid'} />
        <div css={cardDetail}>
          <div css={cardDescription}>{props.description}</div>
        </div>
      </div>
    ),
  };
};
export const getPendingNotificationCardProps = (items: IBotStatus[]): CardProps => {
  return {
    title: '',
    description: formatMessage(`Publishing {count} bots`, { count: items.length }),
    type: 'pending',
    onRenderCardContent: (props) => (
      <div css={cardContent}>
        <Icon css={infoType} iconName="CloudUpload" />
        <div css={cardDetail}>
          <ProgressIndicator label={props.description} />
        </div>
      </div>
    ),
  };
};
