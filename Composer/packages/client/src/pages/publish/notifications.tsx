// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { CardProps } from '../../components/Notifications/NotificationCard';

import { IBotStatus } from './botStatusList';

const cardContent = css`
  display: flex;
  padding: 0 16px 16px 12px;
  min-height: 64px;
  align-item: center;
`;

const cardDetail = css`
  margin-left: 8px;
  flex-grow: 1;
`;

const infoType = css`
  margin-top: 4px;
  color: #0078d4;
`;

const cardDescription = css`
  text-size-adjust: none;
  font-size: 12px;
  line-height: 16px;
  margin-top: 8px;
  margin-right: 16px;
  word-break: break-word;
`;
export const pendingNotificationCard = (items): CardProps => {
  return {
    title: '',
    description: formatMessage(`Publishing {count} bots`, { count: items.length }),
    type: 'pending',
    onRenderCardContent: (props) => (
      <div css={cardContent}>
        <Icon css={infoType} iconName="CloudUpload" />
        <div css={cardDetail}>
          <div css={cardDescription}>{props.description}</div>
          <ProgressIndicator />
        </div>
      </div>
    ),
  };
};

export const publishedNotificationCard = (item: IBotStatus): CardProps => {
  return {
    title: '',
    description: formatMessage(`You have {status} published {name} to {publishTarget}`, {
      status: item.status === 200 ? 'successfully' : 'unsuccessfully',
      name: item.name,
      publishTarget: item.publishTarget,
    }),
    type: 'pending',
    onRenderCardContent: (props) => (
      <div css={cardContent}>
        <Icon css={infoType} iconName="CloudUpload" />
        <Icon css={infoType} iconName={item.status === 200 ? 'Completed' : 'ErrorBadge'} />
        <div css={cardDetail}>
          <div css={cardDescription}>{props.description}</div>
          <ProgressIndicator description="Example description" label="Example title" />
        </div>
      </div>
    ),
  };
};
export const pendingNotification = (items): CardProps => {
  return {
    title: '',
    description: formatMessage(`Publishing {count} bots`, { count: items.length }),
    type: 'pending',
    onRenderCardContent: (props) => (
      <div css={cardContent}>
        <Icon css={infoType} iconName="CloudUpload" />
        <div css={cardDetail}>
          <div css={cardDescription}>{props.description}</div>
          <ProgressIndicator description="Example description" label="Example title" />
        </div>
      </div>
    ),
  };
};
