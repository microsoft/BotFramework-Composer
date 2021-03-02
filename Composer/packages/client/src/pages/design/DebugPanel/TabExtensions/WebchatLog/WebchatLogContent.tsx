// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';

import { rootBotProjectIdSelector } from '../../../../../recoilModel';
import { webChatLogsState } from '../../../../../recoilModel/atoms';

import { WebchatLogItem } from './WebchatLogItem';

// R12: We are showing Errors from the root bot only.
export const WebchatLogContent = () => {
  const currentProjectId = useRecoilValue(rootBotProjectIdSelector);
  const displayedLogs = useRecoilValue(webChatLogsState(currentProjectId ?? ''));

  return (
    <div css={{ padding: '16px 24px' }} data-testid="Webchat-Logs-Container">
      {displayedLogs.map((log, idx) => (
        <WebchatLogItem key={`webchatLog-${idx}`} item={log} />
      ))}
    </div>
  );
};
