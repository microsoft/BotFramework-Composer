// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { DirectLineLog } from '@bfc/shared';
import { jsx } from '@emotion/core';
import { SharedColors, NeutralColors } from '@uifabric/fluent-theme';

import { getDefaultFontSettings } from '../../../../../recoilModel/utils/fontUtil';

export interface WebchatLogItemProps {
  item: DirectLineLog;
}

export const WebchatLogItem: React.FC<WebchatLogItemProps> = ({ item }) => {
  const DEFAULT_FONT_SETTINGS = getDefaultFontSettings();
  return (
    <div
      css={{
        padding: '8px 0px',
        fontSize: DEFAULT_FONT_SETTINGS.fontSize,
        fontFamily: DEFAULT_FONT_SETTINGS.fontFamily,
        color: `${NeutralColors.black}`,
      }}
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
