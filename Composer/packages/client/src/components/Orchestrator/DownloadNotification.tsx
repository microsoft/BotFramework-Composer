// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { SharedColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';

import { CardProps } from '../Notifications/NotificationCard';

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
  color: ${SharedColors.cyanBlue10};
`;

export const orchestratorDownloadNotificationProps = (): CardProps => {
  return {
    title: '',
    description: formatMessage('Downloading Language Model'),
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
