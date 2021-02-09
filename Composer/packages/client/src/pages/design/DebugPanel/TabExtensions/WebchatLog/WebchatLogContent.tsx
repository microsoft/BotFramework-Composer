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
  const [webchatLogs, setWebchatLogs] = useState<WebchatLog[]>([]);

  useEffect(() => {
    extensionEventEmitter.on('wechat:log', (log) => {
      setWebchatLogs([...webchatLogs, log]);
    });
  }, []);

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
