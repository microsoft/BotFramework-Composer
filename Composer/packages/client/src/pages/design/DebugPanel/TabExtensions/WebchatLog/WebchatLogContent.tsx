// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { extensionEventEmitter } from '@bfc/extension-client';
import React, { useEffect, useState } from 'react';

export interface WebchatLog {
  conversationId: string;
  type: 'error' | 'warning' | 'info';
  message: string;
}

export const WebchatLogContent = () => {
  useEffect(() => {
    extensionEventEmitter.on('wechat:log', ({ type, message }) => {
      console.log('Webchat log', type, message);
    });
  }, []);

  const [webchatLogs, setWebchatLogs] = useState<WebchatLog[]>([]);

  (window as any).addLog = (msg) => {
    setWebchatLogs([...webchatLogs, { conversationId: 'test', type: 'error', message: msg }]);
  };
  return (
    <div>
      Webchat Content
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
