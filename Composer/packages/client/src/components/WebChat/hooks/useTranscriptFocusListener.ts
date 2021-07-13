// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useCallback } from 'react';
import { hooks } from 'botframework-webchat';
import { Activity } from 'botframework-schema';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import {
  debugPanelActiveTabState,
  debugPanelExpansionState,
  dispatcherState,
  rootBotProjectIdSelector,
  webChatTrafficState,
} from '../../../recoilModel';
import { WebChatInspectorTabKey } from '../../../pages/design/DebugPanel/TabExtensions/types';

const { useObserveTranscriptFocus } = hooks;

export const useTranscriptFocusListener = () => {
  const currentProjectId = useRecoilValue(rootBotProjectIdSelector);
  const rawWebChatTraffic = useRecoilValue(webChatTrafficState(currentProjectId ?? ''));
  const activeDebugPanelTab = useRecoilValue(debugPanelActiveTabState);
  const setDebugPanelActiveTab = useSetRecoilState(debugPanelActiveTabState);
  const setDebugPanelExpansion = useSetRecoilState(debugPanelExpansionState);
  const { setWebChatInspectionData } = useRecoilValue(dispatcherState);

  // listen for when an activity is focused and inspect the corresponding log item
  const onActivityFocused = useCallback(
    ({ activity }: { activity: Activity }) => {
      const trafficItem = rawWebChatTraffic.find((t) => {
        if (t.trafficType === 'activity') {
          return t.activity.id === activity?.id;
        }
      });
      if (trafficItem && currentProjectId) {
        // only switch to the Web Chat tab if no tab is active
        if (activeDebugPanelTab === undefined) {
          setDebugPanelActiveTab(WebChatInspectorTabKey);
        }
        setDebugPanelExpansion(true);
        setWebChatInspectionData(currentProjectId, { item: trafficItem });
      }
    },
    [activeDebugPanelTab, currentProjectId, rawWebChatTraffic, setDebugPanelActiveTab, setDebugPanelExpansion]
  );

  useObserveTranscriptFocus(onActivityFocused, [onActivityFocused]);
};
