// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { NeutralColors } from '@uifabric/fluent-theme';

import { rootBotProjectIdSelector, webChatInspectionDataState } from '../../recoilModel';

// apply selected state to the Web Chat message bubbles
const webchatSelectedActivity = css`
  div > .webchat__bubble:not(.webchat__bubble--from-user) > .webchat__bubble__content {
    border-color: ${NeutralColors.black};
    border-width: 2px;
  }

  div > .webchat__bubble.webchat__bubble--from-user > .webchat__bubble__content {
    border-color: ${NeutralColors.black};
    border-width: 2px;
  }
`;

type ActivityHighlightWrapperProps = { activityId: string };
export const ActivityHighlightWrapper: React.FC<ActivityHighlightWrapperProps> = (props) => {
  const { activityId, children } = props;
  const currentProjectId = useRecoilValue(rootBotProjectIdSelector);
  const webChatInspectionData = useRecoilValue(webChatInspectionDataState(currentProjectId ?? ''));

  const isSelected = useMemo(() => {
    return (
      webChatInspectionData?.item.trafficType === 'activity' &&
      webChatInspectionData.item.activity.type === 'message' && // TODO: loosen this restriction?
      webChatInspectionData.item.activity.id === activityId
    );
  }, [activityId, webChatInspectionData]);

  return <div css={isSelected ? webchatSelectedActivity : {}}>{children}</div>;
};
