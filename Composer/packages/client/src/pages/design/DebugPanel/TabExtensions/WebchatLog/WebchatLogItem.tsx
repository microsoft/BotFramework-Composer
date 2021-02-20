// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { DirectLineLog } from '@bfc/shared';
import { jsx } from '@emotion/core';
import { SharedColors, CommunicationColors, FontSizes } from '@uifabric/fluent-theme';

export interface WebchatLogItemProps {
  item: DirectLineLog;
}

export const WebchatLogItem: React.FC<WebchatLogItemProps> = ({ item }) => {
  return (
    <div css={{ padding: '8px 0px', fontSize: FontSizes.size12, fontFamily: 'Consolas' }} data-testid="Webchat-LogItem">
      <div data-testid="LogItem__Header">
        [<span css={{ color: `${SharedColors.green20}` }}>{item.timestamp}</span>]
        <span css={{ marginLeft: 10, color: `${CommunicationColors.primary}` }}>{item.status}</span>
        <span css={{ marginLeft: 10 }}>{item.route}</span>
      </div>
      <div
        css={{ color: `${SharedColors.red20}`, whiteSpace: 'pre-wrap', fontWeight: 600 }}
        data-testid="LogItem__Summary"
      >
        {item.message}
      </div>
      {item.details ? <div data-testid="LogItem__Details">{item.details}</div> : null}
    </div>
  );
};
