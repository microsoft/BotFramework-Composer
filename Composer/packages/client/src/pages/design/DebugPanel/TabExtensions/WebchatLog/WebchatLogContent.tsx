// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { extensionEventEmitter } from '@bfc/extension-client';
import { useRecoilValue } from 'recoil';
import React, { useEffect, useState, useCallback } from 'react';

import { currentProjectIdState } from '../../../../../recoilModel';

export interface WebchatLog {
  projectId: string;
  conversationId: string;
  type: 'error' | 'warning' | 'info';
  message: string;
}

export const WebchatLogContent = () => {
  const [webchatLogs, setWebchatLogs] = useState<WebchatLog[]>([]);

  const currentProjectId = useRecoilValue(currentProjectIdState);

  const appendLog = useCallback((log: WebchatLog) => {
    setWebchatLogs([...webchatLogs, log]);
  }, []);

  const clearLogs = useCallback(() => {
    setWebchatLogs([]);
  }, []);

  useEffect(() => {
    extensionEventEmitter.on('webchat:log', (log: WebchatLog) => {
      appendLog(log);
    });

    extensionEventEmitter.on('webchat:start', () => {
      clearLogs();
    });

    extensionEventEmitter.on('webchat:restart', () => {
      clearLogs();
    });
  }, []);

  return (
    <div>
      Webchat logs of {currentProjectId}
      <div>
        {webchatLogs
          .filter((log) => log.projectId === currentProjectId)
          .map((log, idx) => (
            <div key={`webchatLog-${idx}`}>
              {log.type}: {log.message}
            </div>
          ))}
      </div>
    </div>
  );
};
