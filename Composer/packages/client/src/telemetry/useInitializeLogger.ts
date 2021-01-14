// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useCallback, useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { PageNames } from '@bfc/shared';

import { currentProjectIdState, userSettingsState } from '../recoilModel';
import { getPageName } from '../utils/getPageName';
import { useLocation } from '../utils/hooks';

import TelemetryClient from './TelemetryClient';

const { ipcRenderer } = window;

export const useInitializeLogger = () => {
  const rootProjectId = useRecoilValue(currentProjectIdState);
  const { telemetry } = useRecoilValue(userSettingsState);
  const {
    location: { pathname },
  } = useLocation();
  const page = useMemo<PageNames>(() => getPageName(pathname), [pathname]);

  TelemetryClient.setup(telemetry, { rootProjectId, page });

  useEffect(() => {
    ipcRenderer?.on('session-update', (_event, name) => {
      switch (name) {
        case 'session-started':
          TelemetryClient.track('SessionStarted', { os: window.navigator.platform });
          break;
        case 'session-ended':
          TelemetryClient.track('SessionEnded');
          TelemetryClient.drain();
          break;
        default:
          break;
      }
    });
  }, []);

  useEffect(() => {
    // We're currently setting the url to the page name since the url
    // could contain sensitive data such as dialog names
    TelemetryClient.track('NavigateTo', { sectionName: page, url: page });
    TelemetryClient.pageView(page, page);
  }, [page]);

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
