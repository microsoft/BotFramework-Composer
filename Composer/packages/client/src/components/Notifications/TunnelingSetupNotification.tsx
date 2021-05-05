// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';
import { IconButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { NeutralColors, FontSizes, FluentTheme } from '@uifabric/fluent-theme';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { FontWeights } from '@uifabric/styling';

import { platform, OS } from '../../utils/os';

import { CardProps } from './NotificationCard';

const container = css`
  padding: 0 16px 16px 40px;
  position: relative;
`;

const commandContainer = css`
  display: flex;
  flex-flow: row nowrap;
  position: relative;
  padding: 4px 28px 4px 8px;
  background-color: ${NeutralColors.gray20};
  line-height: 22px;
  margin: 1rem 0;
`;

const copyContainer = css`
  margin: 0;
  margin-bottom: 4px;
  font-size: ${FontSizes.size16};
  font-weight: ${FontWeights.semibold};
`;

const copyIconColor = FluentTheme.palette.themeDark;
const copyIconStyles: IButtonStyles = {
  root: { position: 'absolute', right: 0, color: copyIconColor, height: '22px' },
  rootHovered: { backgroundColor: 'transparent', color: copyIconColor },
  rootPressed: { backgroundColor: 'transparent', color: copyIconColor },
};

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

  const copyLocationToClipboard = async () => {
    try {
      await window.navigator.clipboard.writeText(command);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Something went wrong when trying to copy the command to clipboard.', e);
    }
  };

  return (
    <div css={container}>
      <h2 css={copyContainer}>{title}</h2>
      <p css={linkContainer}>
        {formatMessage.rich('<a>Install ngrok</a> and run the following command to continue', {
          a: ({ children }) => (
            <Link key="ngrok-download" href="https://ngrok.com/download" rel="noopener noreferrer" target="_blank">
              {children}
            </Link>
          ),
        })}
      </p>
      <div css={commandContainer}>
        {command}
        <IconButton
          ariaLabel={formatMessage('Copy command to clipboard')}
          iconProps={{ iconName: 'Copy' }}
          styles={copyIconStyles}
          title={formatMessage('Copy command to clipboard')}
          onClick={copyLocationToClipboard}
        />
      </div>
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
