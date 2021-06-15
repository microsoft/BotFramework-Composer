// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { ConversationActivityTrafficItem } from '@botframework-composer/types';
import { useCallback, useRef, useEffect } from 'react';
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
  logsContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  item: ConversationActivityTrafficItem;
  isSelected?: boolean;
  onClickTraffic: (data: WebChatInspectionData) => void;
};

export const WebChatActivityLogItem: React.FC<WebChatActivityLogItemProps> = (props) => {
  const { item, isSelected = false, logsContainerRef, onClickTraffic } = props;
  const { appLocale } = useRecoilValue(userSettingsState);
  const ref = useRef<HTMLSpanElement | null>(null);

  const onClick = useCallback(() => {
    onClickTraffic({ item });
  }, [item, onClickTraffic]);

  useEffect(() => {
    // scroll the activity item into view when it is selected
    if (isSelected && ref.current && logsContainerRef.current) {
      const { bottom: containerBottom, top: containerTop } = logsContainerRef.current.getBoundingClientRect();
      const { bottom: itemBottom, top: itemTop } = ref.current.getBoundingClientRect();
      if (itemBottom > containerBottom || itemTop < containerTop) {
        setTimeout(() => {
          // Web Chat will also be trying to scroll the activity into view
          // which the browser does not like. Wait for a bit until that scroll is done.
          ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }
    }
  }, [isSelected, logsContainerRef]);

  return (
    <span ref={ref} css={[clickable, hoverItem(isSelected), logItem]} onClick={onClick}>
      {renderTimeStamp(item.timestamp, appLocale)}
      {renderActivityArrow(item.activity)}
      <span css={clickableSegment}>{item.activity.type || 'unknown'}</span>
      {item.activity.type === 'message' ? <span css={emphasizedText}>{item.activity.text}</span> : null}
      {item.activity.type === 'trace' ? <span css={emphasizedText}>{item.activity.label}</span> : null}
    </span>
  );
};
