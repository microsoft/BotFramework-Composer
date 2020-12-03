// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useCallback, useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { currentModeState, currentProjectIdState, userSettingsState } from '../recoilModel';

import TelemetryClient from './TelemetryClient';

export const useInitializeLogger = () => {
  const projectId = useRecoilValue(currentProjectIdState);
  const page = useRecoilValue(currentModeState);
  const { telemetry } = useRecoilValue(userSettingsState);

  useEffect(() => {
    TelemetryClient.setup(telemetry, () => ({
      timestamp: new Date().toUTCString(),
      composerVersion: process.env.COMPOSER_VERSION || 'unknown',
      sdkPackageVersion: process.env.SDK_PACKAGE_VERSION || 'unknown',
      page,
      projectId,
    }));
  }, [telemetry, page, projectId]);

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
