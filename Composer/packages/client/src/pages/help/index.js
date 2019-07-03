/** @jsx jsx */
import { jsx } from '@emotion/core';

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
          <div css={help.link}>contosa.com </div>
          <div css={help.link}>contosabot.com </div>
          <div css={help.link}>contosahelp.com </div>
        </div>

        <div css={help.telephone}>998.998.8888</div>
      </div>
    </div>
  );
};
