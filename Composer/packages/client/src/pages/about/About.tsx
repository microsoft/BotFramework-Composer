// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Link } from 'office-ui-fabric-react/lib/Link';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';

import { isElectron } from '../../utils/electronUtil';

import * as about from './styles';

export const About: React.FC<RouteComponentProps> = () => {
  return (
    <div css={about.content} role="main">
      <div css={about.body}>
        <div css={about.smallText}>
          {formatMessage.rich(
            'Our privacy statement is located at <a>https://go.microsoft.com/fwlink/?LinkID=824704</a>. You can learn more about data collection and use in the help documentation and our privacy statement. Your use of the software operates as your consent to these practices.',
            {
              a: ({ children }) => (
                <Link key="privacy" href="https://go.microsoft.com/fwlink/?LinkID=824704">
                  {children}
                </Link>
              ),
            }
          )}
        </div>
        <div css={about.smallerText}>
          {formatMessage.rich(
            `<p1>Copyright (c) Microsoft Corporation.</p1>
            <p2>MIT License</p2>
            <p3>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p3>
            <p4>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p4>
            <p5>THE SOFTWARE IS PROVIDED AS IS, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p5>`,
            {
              p1: ({ children }) => <p key="p1">{children}</p>,
              p2: ({ children }) => <p key="p2">{children}</p>,
              p3: ({ children }) => <p key="p3">{children}</p>,
              p4: ({ children }) => <p key="p4">{children}</p>,
              p5: ({ children }) => <p key="p5">{children}</p>,
            }
          )}
        </div>
        <div css={about.version}>
          {formatMessage(`Release: `) +
            (isElectron()
              ? process.env.COMPOSER_VERSION
              : `${process.env.COMPOSER_VERSION}-${process.env.GIT_SHA}` || 'Unknown')}
        </div>
        <div css={about.diagnosticsInfo}>
          <div css={about.diagnosticsInfoText}>
            <div css={about.diagnosticsInfoTextAlignLeft}>{formatMessage(`SDK runtime packages`)}</div>
            <div css={about.diagnosticsInfoTextAlignLeft}>
              <Link
                href={`https://github.com/microsoft/botframework-sdk/releases/tag/${process.env.SDK_PACKAGE_VERSION}`}
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
        <Link href={'https://docs.microsoft.com/en-us/composer/introduction'} styles={about.helpLink} target={'_blank'}>
          {formatMessage(`Documentation`)}
        </Link>
      </div>
      <div css={about.linkRow}>
        <Link
          href={'https://github.com/microsoft/BotFramework-Composer/issues/new/choose'}
          styles={about.helpLink}
          target={'_blank'}
        >
          {formatMessage(`Report a bug or request a feature`)}
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
      </div>
    </div>
  );
};
