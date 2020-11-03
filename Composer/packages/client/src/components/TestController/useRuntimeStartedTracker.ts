// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';

import { trackBotStatusesSelector } from '../../recoilModel';

export function useRuntimeStartedTracker(postTrackedBotsStartedAction: () => void, trackedProjectIds: string[]) {
  const savedCallback: any = useRef();
  const areBotsStarting = useRecoilValue(trackBotStatusesSelector(trackedProjectIds));

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = postTrackedBotsStartedAction;
  }, [postTrackedBotsStartedAction]);

  useEffect(() => {
    if (trackedProjectIds.length && !areBotsStarting) {
      // Start the root bot now after skills are started.
      if (typeof savedCallback.current === 'function') {
        savedCallback.current();
      }
    }
  }, [areBotsStarting]);
}
