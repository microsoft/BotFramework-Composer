// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { DirectLineLog } from '@bfc/shared';
import { jsx } from '@emotion/core';
import { SharedColors, FontSizes, NeutralColors } from '@uifabric/fluent-theme';

export interface WebchatLogItemProps {
  item: DirectLineLog;
}

export const WebchatLogItem: React.FC<WebchatLogItemProps> = ({ item }) => {
  return (
    <div
      css={{ padding: '8px 0px', fontSize: FontSizes.size14, fontFamily: 'Consolas', color: `${NeutralColors.black}` }}
      data-testid="Webchat-LogItem"
    >
      <div data-testid="LogItem__Header">
        [<span css={{ color: `${SharedColors.green20}` }}>{item.timestamp}</span>]
        <span css={{ marginLeft: 10 }}>{item.status}</span>
        <span css={{ marginLeft: 10 }}>{item.route}</span>
      </div>
      <div css={{ color: `${SharedColors.red20}`, fontWeight: 600, marginLeft: 15 }} data-testid="LogItem__Summary">
        {item.message}
      </div>
      {item.details ? (
        <div css={{ whiteSpace: 'pre-wrap', marginLeft: 15 }} data-testid="LogItem__Details">
          {item.details}
        </div>
      ) : null}
    </div>
  );
};
