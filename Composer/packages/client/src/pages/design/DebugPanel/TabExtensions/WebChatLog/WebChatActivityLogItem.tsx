// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { ConversationActivityTrafficItem } from '@botframework-composer/types';
import { useCallback } from 'react';
import { useRecoilValue } from 'recoil';

import { WebChatInspectionData } from '../../../../../recoilModel/types';
import { userSettingsState } from '../../../../../recoilModel';

import { renderTimeStamp } from './LogItemHelpers';
import { clickableSegment, emphasizedText, hoverItem, logItem } from './logItemStyles';

const clickable = css`
  cursor: pointer;
`;

const renderActivityArrow = (activity) => {
  if (activity?.recipient?.role === 'bot') {
    return <span>{'->'}</span>;
  }
  return <span>{'<-'}</span>;
};

type WebChatActivityLogItemProps = {
  item: ConversationActivityTrafficItem;
  isSelected?: boolean;
  onClickTraffic: (data: WebChatInspectionData) => void;
};

export const WebChatActivityLogItem: React.FC<WebChatActivityLogItemProps> = (props) => {
  const { item, isSelected = false, onClickTraffic } = props;
  const { appLocale } = useRecoilValue(userSettingsState);

  const onClick = useCallback(() => {
    onClickTraffic({ item });
  }, [item, onClickTraffic]);

  return (
    <span css={[clickable, hoverItem(isSelected), logItem]} onClick={onClick}>
      {renderTimeStamp(item.timestamp, appLocale)}
      {renderActivityArrow(item.activity)}
      <span css={clickableSegment}>{item.activity.type || 'unknown'}</span>
      {item.activity.type === 'message' ? <span css={emphasizedText}>{item.activity.text}</span> : null}
      {item.activity.type === 'trace' ? <span css={emphasizedText}>{item.activity.label}</span> : null}
    </span>
  );
};
