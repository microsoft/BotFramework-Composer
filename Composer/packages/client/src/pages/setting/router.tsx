// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { Router } from '@reach/router';
import { useRecoilValue } from 'recoil';

import { applicationErrorState, dispatcherState } from '../../recoilModel';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { About } from '../about/About';

import { AppSettings } from './app-settings/AppSettings';

export const SettingsRoutes = React.memo(({ projectId }: { projectId: string }) => {
  const applicationError = useRecoilValue(applicationErrorState);
  const { setApplicationLevelError, fetchProjectById } = useRecoilValue(dispatcherState);

  return (
    <ErrorBoundary
      currentApplicationError={applicationError}
      fetchProject={() => fetchProjectById(projectId)}
      setApplicationLevelError={setApplicationLevelError}
    >
      <Router>
        <AppSettings default path="application" />
        <About path="about" />
      </Router>
    </ErrorBoundary>
  );
});
