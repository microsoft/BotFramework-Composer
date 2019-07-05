/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Link } from 'office-ui-fabric-react/lib/Link';
import formatMessage from 'format-message';

import * as help from './styles';

export const Help = () => {
  return (
    <div css={help.outline}>
      <div css={help.content}>
        <div css={help.title}> Info & help </div>
        <div css={help.introduction}>
          <div css={help.introText}>
            sssssssssssssssssssssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss
            sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss
            sssssssssssssssssssssssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss
            sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss
            sssssssssssssssssssss sssssssssssssssssssssssssssss sssssssssssssssssssssssssssssssssssssssssssss
            sssssssssssssss sssssssssssssss sssssssssssssss sssssssssssssss sssssssssssssss
            ssssssssssssssssssssssssssssssssssssssssssssssssss sssssssssssssssssssssssssssssssssssssss
            sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss
            sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssssssssssssssssssssssss
            sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss
            sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss
            sssssssssssssssssssssssssssss sssssssssssssssssssssssssssssssssssssssssssss sssssssssssssss sssssssssssssss
            sssssssssssssss sssssssssssssss sssssssssssssss ssssssssssssssssssssssssssssssssssssssssssssssssss
          </div>
        </div>

        <div css={help.linkContainer}>
          <div css={help.linkTitle}>Links: </div>
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

        <div css={help.telephone}>998.998.8888</div>
      </div>
    </div>
  );
};
