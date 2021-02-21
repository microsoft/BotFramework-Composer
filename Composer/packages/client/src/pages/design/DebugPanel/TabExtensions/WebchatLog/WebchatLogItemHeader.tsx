// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';

import { rootBotProjectIdSelector, webChatLogsState } from '../../../../../recoilModel';
import { DebugPanelErrorIndicator } from '../DebugPanelErrorIndicator';

export const WebchatLogItemHeader = () => {
  const rootBotId = useRecoilValue(rootBotProjectIdSelector);
  const logItems = useRecoilValue(webChatLogsState(rootBotId ?? ''));

  return (
    <div
      css={css`
        display: flex;
        flex-direction: row;
        align-items: center;
      `}
      data-testid="Tab-Diagnostics"
    >
      <div
        css={css`
          margin-right: 4px;
        `}
      >
        {formatMessage('Webchat Inspector')}
      </div>
      <DebugPanelErrorIndicator hasError={logItems.length > 0} />
    </div>
  );
};
