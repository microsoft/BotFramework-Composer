/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Link } from 'office-ui-fabric-react/lib/Link';
import formatMessage from 'format-message';

import * as help from './styles';

export const Help = () => {
  return (
    <div css={help.outline}>
      <div css={help.content}>
        <div css={help.title}> {formatMessage(`Info & help`)} </div>
        <div css={help.introduction}>
          <div css={help.introText}>
            {formatMessage(
              `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et 
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip 
              ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
              fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt 
              mollit anim id est laborum.`
            )}
          </div>
        </div>

        <div css={help.linkContainer}>
          <div css={help.linkTitle}>{formatMessage(`Links:`)}</div>
          <Link href={'/about'} tabIndex={-1} target={'_blank'}>
            <div css={help.link}>{formatMessage(`contosa.com`)} </div>
          </Link>
          <Link href={'/about'} tabIndex={-1} target={'_blank'}>
            <div css={help.link}>{formatMessage(`contosabot.com `)}</div>
          </Link>
          <Link href={'/about'} tabIndex={-1} target={'_blank'}>
            <div css={help.link}>{formatMessage(`contosahelp.com`)} </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
