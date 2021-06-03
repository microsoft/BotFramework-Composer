// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { rootBotProjectIdSelector, webChatInspectionDataState } from '../../recoilModel';

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

  return (
    <div css={{ borderStyle: 'solid', borderColor: isSelected ? 'red' : 'black', borderWidth: isSelected ? 3 : 0 }}>
      {children}
    </div>
  );
};
