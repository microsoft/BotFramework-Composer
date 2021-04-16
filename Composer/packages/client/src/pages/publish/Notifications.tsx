// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { CardProps } from '../../components/Notifications/NotificationCard';

import { BotStatus } from './type';

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
  color: #0078d4;
`;

const cardDescription = css`
  text-size-adjust: none;
  font-size: 12px;
  line-height: 16px;
  margin-right: 16px;
  word-break: break-word;
`;

export const getPublishedNotificationCardProps = (item: BotStatus): CardProps => {
  const statusIconStyle = css({
    margin: '12px 0 0 -1px',
    width: '12px',
    height: '12px',
    fontSize: '12px',
    color: item.status === 200 ? '#27AE60' : 'rgb(161, 159, 157)',
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
export const getPendingNotificationCardProps = (items: BotStatus[]): CardProps => {
  return {
    title: '',
    description: formatMessage(
      `Publishing {
      count, plural,
        =1 {one bot}
        other {# bots}
    }`,
      { count: items.length }
    ),
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

export const getPendingQNANotificationCardProps = (): CardProps => {
  return {
    title: '',
    description: formatMessage(`Creating QnA Maker`),
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

export const getCompletedQNANotificationCardProps = (opts: { time: number }): CardProps => {
  const statusIconStyle = css({
    margin: '12px 0 0 -1px',
    width: '12px',
    height: '12px',
    fontSize: '12px',
    color: '#27AE60',
  });
  return {
    title: '',
    description: formatMessage(`Your QnA Maker is ready! It took { time } minutes to complete.`, { time: opts.time }),
    type: 'pending',
    onRenderCardContent: (props) => (
      <div css={cardContent}>
        <Icon css={infoType} iconName="CloudUpload" />
        <Icon css={statusIconStyle} iconName={'SkypeCircleCheck'} />
        <div css={cardDetail}>
          <div css={cardDescription}>{props.description}</div>
        </div>
      </div>
    ),
  };
};
