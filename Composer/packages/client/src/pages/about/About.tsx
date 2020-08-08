// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Link } from 'office-ui-fabric-react/lib/Link';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';

import * as about from './styles';

export const About: React.FC<RouteComponentProps> = () => {
  return (
    <div css={about.outline} role="main">
      <div css={about.content}>
        <h1 css={about.title}> {formatMessage(`About`)} </h1>
        <div css={about.body}>
          <div css={about.version}>{formatMessage(`Release: `) + (process.env.COMPOSER_VERSION || 'Unknown')}</div>
          <div css={about.description}>
            <p>
              {formatMessage(
                `Bot Framework Composer is a visual authoring canvas for building bots and other types of conversational application with the Microsoft Bot Framework technology stack. With Composer you will find everything you need to build a modern, state-of-the-art conversational experience.`
              )}
            </p>
            <p>
              {formatMessage(
                `Bot Framework Composer enables developers and multi-disciplinary teams to build all kinds of conversational experiences, using the latest components from the Bot Framework: SDK, LG, LU, and declarative file formats, all without writing code.`
              )}
              <Link
                href={'https://docs.microsoft.com/en-us/composer/'}
                style={{ marginLeft: '5px', textDecoration: 'underline' }}
                target={'_blank'}
              >
                {formatMessage(`Learn more`)}
              </Link>
            </p>
          </div>
          <div css={about.DiagnosticsInfo}>
            <div css={about.DiagnosticsInfoText}>
              <div css={about.DiagnosticsInfoTextAlignLeft}>{formatMessage(`SDK runtime packages`)}</div>
              <div css={about.DiagnosticsInfoTextAlignLeft}>
                <Link
                  href={`https://www.nuget.org/packages/Microsoft.Bot.Builder/${process.env.SDK_PACKAGE_VERSION}`}
                  style={{ marginLeft: '5px', textDecoration: 'underline' }}
                  target={'_blank'}
                >
                  {process.env.SDK_PACKAGE_VERSION || 'Unknown'}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div css={about.linkRow}>
          <Link
            href={'https://github.com/microsoft/BotFramework-Composer/issues/new/choose'}
            styles={about.helpLink}
            target={'_blank'}
          >
            {formatMessage(`Getting Help`)}
          </Link>
        </div>
        <div css={about.linkContainer}>
          <div css={about.linkRow}>
            <Icon iconName={'BlockedSite'} styles={about.icon} tabIndex={-1} />
            <Link
              href={'https://github.com/microsoft/BotFramework-Composer/blob/stable/LICENSE.md'}
              styles={about.link}
              target={'_blank'}
            >
              {formatMessage(`Terms of Use`)}
            </Link>
          </div>
          <div css={about.linkRow}>
            <Icon ariaLabel={formatMessage('Privacy button')} iconName={'Lock'} styles={about.icon} />
            <Link
              href={'https://github.com/microsoft/BotFramework-Composer/blob/stable/PRIVACY.md'}
              styles={about.link}
              target={'_blank'}
            >
              {formatMessage(`Privacy`)}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
