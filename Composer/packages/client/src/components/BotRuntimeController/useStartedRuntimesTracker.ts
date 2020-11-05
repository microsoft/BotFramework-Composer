// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { MutableRefObject, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';

import { trackBotStatusesSelector } from '../../recoilModel';

export function useStartedRuntimesTracker(postTrackedBotsStartedAction: () => void, trackedProjectIds: string[]) {
  const savedCallback: MutableRefObject<Function | undefined> = useRef();
  const areBotsStarting = useRecoilValue(trackBotStatusesSelector(trackedProjectIds));

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = postTrackedBotsStartedAction;
  }, [postTrackedBotsStartedAction]);

  useEffect(() => {
    if (trackedProjectIds.length && !areBotsStarting && typeof savedCallback.current === 'function') {
      savedCallback.current();
    }
  }, [areBotsStarting]);
}
