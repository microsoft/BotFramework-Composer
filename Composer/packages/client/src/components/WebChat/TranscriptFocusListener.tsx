// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FC, useCallback } from 'react';
import { hooks } from 'botframework-webchat';
import { Activity } from 'botframework-schema';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import {
  debugPanelActiveTabState,
  debugPanelExpansionState,
  dispatcherState,
  rootBotProjectIdSelector,
  webChatTrafficState,
} from '../../recoilModel';
import { WebChatInspectorTabKey } from '../../pages/design/DebugPanel/TabExtensions/types';

const { useObserveTranscriptFocus } = hooks;

export const TranscriptFocusListener: FC<{}> = () => {
  const currentProjectId = useRecoilValue(rootBotProjectIdSelector);
  const rawWebChatTraffic = useRecoilValue(webChatTrafficState(currentProjectId ?? ''));
  const setDebugPanelActiveTab = useSetRecoilState(debugPanelActiveTabState);
  const setDebugPanelExpansion = useSetRecoilState(debugPanelExpansionState);
  const { setWebChatInspectionData } = useRecoilValue(dispatcherState);
  const onActivityFocused = useCallback(
    ({ activity }: { activity: Activity }) => {
      const trafficItem = rawWebChatTraffic.find((t) => {
        if (t.trafficType === 'activity') {
          return t.activity.id === activity?.id;
        }
      });
      if (trafficItem && currentProjectId) {
        setDebugPanelActiveTab(WebChatInspectorTabKey);
        setDebugPanelExpansion(true);
        setWebChatInspectionData(currentProjectId, { item: trafficItem });
      }
    },
    [currentProjectId, rawWebChatTraffic, setDebugPanelActiveTab, setDebugPanelExpansion]
  );

  useObserveTranscriptFocus(onActivityFocused, [onActivityFocused]);

  // strictly listen for and act on a new activity being selected; do not render anything
  return null;
};
