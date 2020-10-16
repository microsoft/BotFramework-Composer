// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';

import { trackBotStatusesSelector } from '../../recoilModel';

export function useBotStatusTracker(postSkillsStartAction: () => void, trackedProjectIds: string[]) {
  const savedCallback: any = useRef();
  const areBotsStarting = useRecoilValue(trackBotStatusesSelector(trackedProjectIds));

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = postSkillsStartAction;
  }, [postSkillsStartAction]);

  useEffect(() => {
    const trackedBotsStarted = !areBotsStarting;
    if (trackedProjectIds.length && trackedBotsStarted) {
      // Start the root bot now after skills are started.
      savedCallback.current();
    }
  }, [areBotsStarting]);
}
