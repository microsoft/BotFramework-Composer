// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { extensionEventEmitter } from '@bfc/extension-client';
import React, { useEffect, useState, useCallback } from 'react';

export interface WebchatLog {
  skillId: string;
  conversationId: string;
  type: 'error' | 'warning' | 'info';
  message: string;
}

export const WebchatLogContent = () => {
  const [webchatLogs, setWebchatLogs] = useState<WebchatLog[]>([]);

  const appendLog = useCallback((log: WebchatLog) => {
    setWebchatLogs([...webchatLogs, log]);
  }, []);

  const clearLogs = useCallback(() => {
    setWebchatLogs([]);
  }, []);

  useEffect(() => {
    extensionEventEmitter.on('wechat:log', (log: WebchatLog) => {
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
      Webchat logs
      <div>
        {webchatLogs.map((log, idx) => (
          <div key={`webchatLog-${idx}`}>
            {log.type}: {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};
