// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { CardProps, cardContent, infoType, cardDetail, cardDescription } from '../../components/NotificationCard';

import { IBotStatus } from './botStatusList';

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
          <ProgressIndicator description="Example description" label="Example title" />
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
