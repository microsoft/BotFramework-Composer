// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect } from 'react';
import { hooks } from 'botframework-webchat';
import { useRecoilValue } from 'recoil';

import { rootBotProjectIdSelector, webChatInspectionDataState } from '../../../recoilModel';

const { useScrollTo } = hooks;

export const useActivityInspectionListener = () => {
  const currentProjectId = useRecoilValue(rootBotProjectIdSelector);
  const webChatInspectionData = useRecoilValue(webChatInspectionDataState(currentProjectId ?? ''));
  const scrollToActivity = useScrollTo();

  // listen for when an activity item is inspected in the log, and scroll to the activity
  useEffect(() => {
    if (
      webChatInspectionData?.item.trafficType === 'activity' &&
      webChatInspectionData.item.activity.type === 'message'
    ) {
      scrollToActivity({ activityID: webChatInspectionData.item.activity.id }, { behavior: 'smooth' });
    }
  }, [webChatInspectionData]);
};
