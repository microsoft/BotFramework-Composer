// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { Router, Redirect } from '@reach/router';
import { useRecoilValue } from 'recoil';

import { applicationErrorState, dispatcherState } from '../../recoilModel';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { About } from '../about/About';

import { DialogSettings } from './dialog-settings/DialogSettings';
import { AppSettings } from './app-settings/AppSettings';
import { RuntimeSettings } from './runtime-settings/RuntimeSettings';
// import { Plugins } from './plugins/Plugins';

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
        <Redirect
          noThrow
          from="/"
          to={projectId ? `/settings/bot/${projectId}/dialog-settings` : '/settings/application'}
        />
        <AppSettings default path="application" />
        <About path="about" />
        <DialogSettings path="/bot/:projectId/dialog-settings" />
        <RuntimeSettings path="/bot/:projectId/runtime" />
        {/* <Plugins path="plugins" /> */}
      </Router>
    </ErrorBoundary>
  );
});
