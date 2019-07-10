/** @jsx jsx */

import { jsx } from '@emotion/core';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import formatMessage from 'format-message';

import * as about from './styles';

export const About = () => {
  return (
    <div css={about.outline}>
      <div css={about.content}>
        <div css={about.title}> {formatMessage(`About`)} </div>
        <div css={about.body}>
          <div css={about.version}>{formatMessage(`Version 0.0.1 - Alpha`)}</div>
          <div css={about.description}>
            <p>
              {formatMessage(` Bot Framework Designer is an integrated development environment (IDE) for building 
            bots and other types of conversational software with the Microsoft Bot Framework technology stack. 
            Inside this web-based tool, you'll find everything you need to build a modern, state-of-the-art conversational experience.`)}
            </p>
            <p>
              {formatMessage(`Inside this web-based tool, you'll find everything you need to build a modern, state-of-the-art conversational experience.
            Bot Framework Designer enables teams working to create bots to build all kinds of conversational experiences that use the 
            latest features from the Bot Framework SDK without writing code. The Designer app reads and writes from the Adaptive Dialog format, 
            a JSON specification shared by many tools provided by the Bot Framework. Dialogs, NLU training data and message templates are treated 
                like normal developer assets - files that can be committed to source control and deployed alongside code updates.`)}
            </p>
          </div>
          <div css={about.DiagnosticsInfo}>
            <div css={about.DiagnosticsInfoText}>
              <div css={about.DiagnosticsInfoTextAlignLeft}>{formatMessage(`Build SHA`)}</div>
              <div css={about.DiagnosticsInfoTextAlignLeft}>
                {process.env.GIT_SHA || 'Unable to find Build number'}{' '}
              </div>
            </div>
          </div>
        </div>
        <div css={about.linkRow}>
          <Link
            href={'https://github.com/microsoft/BotFramework-Designer/blob/master/help.md'}
            tabIndex={-1}
            target={'_blank'}
          >
            <div css={about.helpLink}>{formatMessage(`Getting Help`)} </div>
          </Link>
        </div>
        <div css={about.linkContainer}>
          <div css={about.linkRow}>
            <IconButton styles={about.icon} iconProps={{ iconName: 'Info' }} />
            <Link href={'/about'} tabIndex={-1} target={'_blank'}>
              <div css={about.link}>{formatMessage(`Terms of Use`)} </div>
            </Link>
          </div>
          <div css={about.linkRow}>
            <IconButton styles={about.icon} iconProps={{ iconName: 'BlockedSite' }} />
            <Link href={'/about'} tabIndex={-1} target={'_blank'}>
              <div css={about.link}>{formatMessage(`Third-Party Notices`)} </div>
            </Link>
          </div>
          <div css={about.linkRow}>
            <IconButton styles={about.icon} iconProps={{ iconName: 'Lock' }} />
            <Link
              href={'https://github.com/microsoft/BotFramework-Designer/blob/master/Private-Preview-LICENSE.md'}
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
