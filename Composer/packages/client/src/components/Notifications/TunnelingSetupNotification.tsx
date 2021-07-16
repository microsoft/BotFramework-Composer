// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { CopyableText } from '@bfc/ui-shared';
import { css, jsx } from '@emotion/core';
import { FontSizes } from '@uifabric/fluent-theme';
import { FontWeights } from '@uifabric/styling';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import React from 'react';

import { OS, platform } from '../../utils/os';

import { CardProps } from './NotificationCard';

const container = css`
  padding: 0 8px 16px 12px;
  position: relative;
`;

const header = css`
  margin: 0;
  margin-bottom: 4px;
  font-size: ${FontSizes.size16};
  font-weight: ${FontWeights.semibold};
`;

const linkContainer = css`
  margin: 0;
`;

const getNgrok = () => {
  const os = platform();
  if (os === OS.Windows) {
    return 'ngrok.exe';
  }

  return 'ngrok';
};

export const TunnelingSetupNotification: React.FC<CardProps> = (props) => {
  const { title, data } = props;
  const port = data?.port;
  const command = `${getNgrok()} http ${port} --host-header=localhost`;

  return (
    <div css={container}>
      <h2 css={header}>{title}</h2>
      <p css={linkContainer}>
        {formatMessage.rich('<a>Install ngrok</a> and run the following command to continue', {
          a: ({ children }) => (
            <Link key="ngrok-download" href="https://ngrok.com/download" rel="noopener noreferrer" target="_blank">
              {children}
            </Link>
          ),
        })}
      </p>
      <CopyableText
        buttonAriaLabel={formatMessage('Copy command to clipboard')}
        buttonTitle={formatMessage('Copy command to clipboard')}
        text={command}
      />
      <p css={linkContainer}>
        <Link
          href="https://docs.microsoft.com/en-us/composer/how-to-connect-to-a-skill"
          rel="noopener noreferrer"
          target="_blank"
        >
          {formatMessage('Learn more')}
        </Link>
      </p>
    </div>
  );
};
