// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';

import { currentProjectIdState } from '../../../../../recoilModel';
import { webChatLogsState } from '../../../../../recoilModel/atoms';

import { WebchatLogItem } from './WebchatLogItem';

export const WebchatLogContent = () => {
  const currentProjectId = useRecoilValue(currentProjectIdState);
  const displayedLogs = useRecoilValue(webChatLogsState(currentProjectId));

  return (
    <div css={{ padding: '16px 24px' }} data-testid="Webchat-Logs-Container">
      {displayedLogs.map((log, idx) => (
        <WebchatLogItem key={`webchatLog-${idx}`} item={log} />
      ))}
    </div>
  );
};
