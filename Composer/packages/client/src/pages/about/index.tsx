// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';

import * as about from './styles';

export const About: React.FC<RouteComponentProps> = () => {
  return (
    <div css={about.outline}>
      <div css={about.content}>
        <h1 css={about.title}> {formatMessage(`About`)} </h1>
        <div css={about.body}>
          <div css={about.version}>{formatMessage(`Release: `) + (process.env.COMPOSER_VERSION || 'Unknown')}</div>
          <div css={about.description}>
            <p>
              {formatMessage(`Bot Framework Composer is an integrated development environment (IDE) for building
            bots and other types of conversational software with the Microsoft Bot Framework technology stack.
            Inside this web-based tool you will find everything you need to build a modern, state-of-the-art conversational experience.`)}
            </p>
            <p>
              {formatMessage(`Bot Framework Composer enables teams working to create bots to build all kinds of conversational experiences that use the
            latest components from the Bot Framework: SDK, LG, LU, and declarative file formats, all without writing code.`)}
              <Link
                href={'https://github.com/microsoft/BotFramework-Composer/blob/stable/toc.md'}
                tabIndex={-1}
                target={'_blank'}
                style={{ marginLeft: '5px', textDecoration: 'underline' }}
              >
                {formatMessage(`Learn more`)}
              </Link>
            </p>
          </div>
          <div css={about.DiagnosticsInfo}>
            <div css={about.DiagnosticsInfoText}>
              <div css={about.DiagnosticsInfoTextAlignLeft}>{formatMessage(`Application SHA`)}</div>
              <div css={about.DiagnosticsInfoTextAlignLeft}>
                <Link
                  href={`https://github.com/microsoft/BotFramework-Composer/commit/${process.env.GIT_SHA}`}
                  tabIndex={-1}
                  target={'_blank'}
                  style={{ marginLeft: '5px', textDecoration: 'underline' }}
                >
                  {process.env.GIT_SHA || 'Unknown'}
                </Link>
              </div>
            </div>
            <div css={about.DiagnosticsInfoText}>
              <div css={about.DiagnosticsInfoTextAlignLeft}>{formatMessage(`SDK runtime packages`)}</div>
              <div css={about.DiagnosticsInfoTextAlignLeft}>
                <Link
                  href={`https://botbuilder.myget.org/feed/botbuilder-v4-dotnet-daily/package/nuget/Microsoft.Bot.Builder.Dialogs.Adaptive/${process.env.SDK_PACKAGE_VERSION}`}
                  tabIndex={-1}
                  target={'_blank'}
                  style={{ marginLeft: '5px', textDecoration: 'underline' }}
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
            tabIndex={-1}
            target={'_blank'}
          >
            <div css={about.helpLink}>{formatMessage(`Getting Help`)} </div>
          </Link>
        </div>
        <div css={about.linkContainer}>
          <div css={about.linkRow}>
            <IconButton
              styles={about.icon}
              ariaLabel={formatMessage('Terms of User Button')}
              iconProps={{ iconName: 'BlockedSite' }}
              tabIndex={-1}
            />
            <Link
              href={'https://github.com/microsoft/BotFramework-Composer/blob/stable/LICENSE.md'}
              tabIndex={-1}
              target={'_blank'}
            >
              <div css={about.link}>{formatMessage(`Terms of Use`)} </div>
            </Link>
          </div>
          <div css={about.linkRow}>
            <IconButton
              styles={about.icon}
              ariaLabel={formatMessage('Privacy button')}
              iconProps={{ iconName: 'Lock' }}
              tabIndex={-1}
            />
            <Link
              href={'https://github.com/microsoft/BotFramework-Composer/blob/stable/PRIVACY.md'}
              tabIndex={-1}
              target={'_blank'}
            >
              <div css={about.link}>{formatMessage(`Privacy`)}</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
