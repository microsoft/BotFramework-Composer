// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LogData } from '@bfc/shared';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { currentModeState, currentProjectIdState, ServerSettingsState } from '../recoilModel';

import { getEventLogger } from './getEventLogger';
import { createLogger, initializeLogger } from './telemetryLogger';

export const useInitializeLogger = () => {
  const [, forceRender] = useState({});
  const projectId = useRecoilValue(currentProjectIdState);
  const page = useRecoilValue(currentModeState);
  const { telemetry } = useRecoilValue(ServerSettingsState);

  useEffect(() => {
    initializeLogger(createLogger(telemetry), () => ({
      timestamp: new Date().toUTCString(),
      composerVersion: process.env.COMPOSER_VERSION || 'unknown',
      sdkPackageVersion: process.env.SDK_PACKAGE_VERSION || 'unknown',
      page,
      projectId,
    }));

    forceRender({});
  }, [telemetry, page, projectId]);
};

export const useEventLogger = (properties?: LogData | (() => LogData)) => {
  return getEventLogger(properties);
};
