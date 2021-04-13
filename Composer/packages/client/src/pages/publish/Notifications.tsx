// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { FontSizes } from '@uifabric/fluent-theme';

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
    type: item.status === 200 ? 'success' : 'error',
    onRenderCardContent: (props) => (
      <div css={cardContent}>
        <Icon css={infoType} iconName="CloudUpload" />
        <Icon css={statusIconStyle} iconName={item.status === 200 ? 'Completed' : 'CircleAdditionSolid'} />
        <div css={cardDetail}>
          <div css={cardDescription}>{props.description}</div>
        </div>
      </div>
    ),
  };
};

export const getSkillPublishedNotificationCardProps = (item: BotStatus, url?: string): CardProps => {
  const skillCardContent = css`
    display: flex;
    padding: 0 16px 16px 12px;
    min-height: 64px;
  `;
  const statusIconStyle = css({
    margin: '12px 0 0 -1px',
    width: '12px',
    height: '12px',
    fontSize: '12px',
    color: '#D92525',
  });
  const errorType = css`
    margin-top: 4px;
    color: #d92525;
  `;
  const successType = css`
    margin-top: 4px;
    color: #27ae60;
  `;
  const cardTitle = css`
    font-size: ${FontSizes.size16};
    lint-height: 22px;
    margin-right: 16px;
  `;

  const cardDescription = css`
    text-size-adjust: none;
    font-size: ${FontSizes.size10};
    margin-top: 8px;
    margin-right: 16px;
    word-break: break-word;
  `;

  const linkButton = css`
    color: #323130;
    float: right;
    font-size: 12px;
    height: auto;
    margin: 10px 8px 0 0;
  `;
  return {
    title: item.status === 200 ? formatMessage('Your skill is ready to be shared!') : '',
    description:
      item.status === 200
        ? formatMessage(
            'Keep this URL handy to share it with other developers to use in their bot projects. You can find this URL in the project settings tab.'
          )
        : formatMessage(`Your skill could not be published.`),
    type: item.status === 200 ? 'success' : 'error',
    onRenderCardContent: (props) => {
      const { title, description } = props;
      if (item.status === 200) {
        return (
          <div css={skillCardContent}>
            <Icon css={successType} iconName="SkypeCircleCheck" />
            <div css={cardDetail}>
              <div css={cardTitle}>{title}</div>
              {description && <div css={cardDescription}>{description}</div>}
              {url && (
                <div css={linkButton}>
                  {url}
                  <IconButton
                    iconProps={{ iconName: 'copy' }}
                    styles={{ icon: { fontSize: '12px', color: '#0078D4' } }}
                    onClick={() => navigator.clipboard.writeText(url)}
                  />
                </div>
              )}
            </div>
          </div>
        );
      } else {
        return (
          <div css={cardContent}>
            <Icon css={errorType} iconName="CloudUpload" />
            <Icon css={statusIconStyle} iconName="StatusCircleErrorX" />
            <div css={cardDetail}>
              <div css={cardDescription}>{props.description}</div>
            </div>
          </div>
        );
      }
    },
  };
};

export const getPendingNotificationCardProps = (items: BotStatus[], isSkill = false): CardProps => {
  const description = isSkill
    ? 'Publishing your skill...'
    : formatMessage(
        `Publishing {
      count, plural,
        =1 {one bot}
        other {# bots}
    }`,
        { count: items.length }
      );
  return {
    title: '',
    description,
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
