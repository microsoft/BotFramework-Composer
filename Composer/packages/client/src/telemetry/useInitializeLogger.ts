// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useCallback, useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { currentProjectIdState, userSettingsState } from '../recoilModel';

import TelemetryClient from './TelemetryClient';

export const useInitializeLogger = () => {
  const projectId = useRecoilValue(currentProjectIdState);
  const { telemetry } = useRecoilValue(userSettingsState);

  TelemetryClient.setup(telemetry, { projectId });

  const handleBeforeUnload = useCallback(() => {
    TelemetryClient.drain();
  }, []);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};
