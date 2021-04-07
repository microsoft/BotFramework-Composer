// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { ConversationNetworkErrorItem, ConversationNetworkTrafficItem } from '@botframework-composer/types';
import { css, jsx } from '@emotion/core';
import { SharedColors } from '@uifabric/fluent-theme';
import React, { useCallback } from 'react';
import { useRecoilValue } from 'recoil';

import { userSettingsState } from '../../../../../recoilModel';
import { WebChatInspectionData } from '../../../../../recoilModel/types';

import { renderTimeStamp } from './LogItemHelpers';
import { clickableSegment, emphasizedText, hoverItem, logItem } from './logItemStyles';

const networkItem = css`
  display: flex;
  flex-direction: column;
`;

const redErrorText = css`
  color: ${SharedColors.red20};
`;

type WebChatNetworkLogItemProps = {
  index: number;
  item: ConversationNetworkTrafficItem | ConversationNetworkErrorItem;
  isSelected?: boolean;
  onClickTraffic: (data: WebChatInspectionData) => void;
};

export const WebChatNetworkLogItem: React.FC<WebChatNetworkLogItemProps> = (props) => {
  const { index, item, isSelected = false, onClickTraffic } = props;
  const { appLocale } = useRecoilValue(userSettingsState);
  const onClickRequest = useCallback(() => {
    onClickTraffic({ item, mode: 'request' });
  }, []);
  const onClickResponse = useCallback(() => {
    onClickTraffic({ item, mode: 'response' });
  }, []);

  const errorContent =
    item.trafficType === 'networkError' ? (
      <React.Fragment>
        <span css={redErrorText}>{item.error.message}</span>
        <span css={emphasizedText}>{item.error.details}</span>
      </React.Fragment>
    ) : null;

  return (
    <div key={`webchat-network-item-${index}`} css={[logItem, hoverItem(isSelected), networkItem]}>
      <span>
        {renderTimeStamp(item.timestamp, appLocale)}
        <span css={[clickableSegment]} onClick={onClickRequest}>
          {`${item.request.method}`}
        </span>
        <span css={[clickableSegment]} onClick={onClickResponse}>
          {`${item.response.statusCode}`}
        </span>
        {item.request.route}
      </span>
      {errorContent}
    </div>
  );
};
