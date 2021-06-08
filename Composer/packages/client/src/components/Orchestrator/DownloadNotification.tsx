// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { SharedColors } from '@uifabric/fluent-theme';
import { FontSizes } from '@uifabric/styling';
import formatMessage from 'format-message';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';

import { CardProps } from '../Notifications/NotificationCard';
import { colors } from '../constants';

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

const cardDescription = css`
  text-size-adjust: none;
  font-size: 12px;
  line-height: 16px;
  margin-right: 16px;
  word-break: break-word;
`;

const infoType = css`
  margin-top: 4px;
  color: ${SharedColors.cyanBlue10};
`;

const errorIcon = css`
  color: ${colors.errorIcon},
  marginRight: 8,
  paddingLeft: 12,
  fontSize: ${FontSizes.mediumPlus},
`;

export const orchestratorDownloadNotificationProps = (): CardProps => {
  return {
    title: '',
    description: formatMessage('Orchestrator: Downloading language model'),
    type: 'pending',
    onRenderCardContent: (props) => (
      <div css={cardContent}>
        <Icon css={infoType} iconName="CloudDownload" />
        <div css={cardDetail}>
          <ProgressIndicator label={props.description} />
        </div>
      </div>
    ),
  };
};

export const orchestratorDownloadErrorProps = (err: string): CardProps => {
  return {
    title: '',
    description: err,
    type: 'error',
    onRenderCardContent: (props) => (
      <div css={cardContent}>
        <Icon css={errorIcon} iconName="ErrorBadge" />
        <div css={cardDetail}>
          <div css={cardDescription}>{props.description}</div>
        </div>
      </div>
    ),
  };
};
