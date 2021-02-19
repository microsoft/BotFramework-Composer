// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { WebchatLog } from '@bfc/shared';
import { jsx } from '@emotion/core';

export interface WebchatLogItemProps {
  item: WebchatLog;
}

export const WebchatLogItem: React.FC<WebchatLogItemProps> = ({ item }) => {
  return (
    <div>
      [<span css={{ color: '#327e36' }}>{item.timestamp}</span>]
      <span css={{ marginLeft: 10, color: '#007acc' }}>{item.status}</span>
      <span css={{ marginLeft: 10, color: '#666' }}>{item.route}</span>
      <span css={{ marginLeft: 10, color: '#000' }}>{item.message}</span>
      <span css={{ marginLeft: 10, color: '#000' }}>{item.details}</span>
    </div>
  );
};
