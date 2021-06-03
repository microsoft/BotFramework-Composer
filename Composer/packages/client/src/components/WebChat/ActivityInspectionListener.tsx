// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FC, useEffect } from 'react';
import { hooks } from 'botframework-webchat';
import { useRecoilValue } from 'recoil';

import { rootBotProjectIdSelector, webChatInspectionDataState } from '../../recoilModel';

const { useScrollTo } = hooks;

export const ActivityInspectionListener: FC<{}> = () => {
  const currentProjectId = useRecoilValue(rootBotProjectIdSelector);
  const webChatInspectionData = useRecoilValue(webChatInspectionDataState(currentProjectId ?? ''));
  const scrollToActivity = useScrollTo();

  useEffect(() => {
    if (
      webChatInspectionData?.item.trafficType === 'activity' &&
      webChatInspectionData.item.activity.type === 'message' // TODO: loosen this restriction?
    ) {
      scrollToActivity({ activityID: webChatInspectionData.item.activity.id }, { behavior: 'smooth' });
    }
  }, [webChatInspectionData]);

  // only listen for when a traffic item is inspected from the log; do not render anything
  return null;
};
