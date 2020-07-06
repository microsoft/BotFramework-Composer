// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { Router, Redirect } from '@reach/router';

import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { About } from '../about/About';

import { Plugins } from './plugins/Plugins';
import { DialogSettings } from './dialog-settings/DialogSettings';
import { AppSettings } from './app-settings/AppSettings';
import { RuntimeSettings } from './runtime-settings/RuntimeSettings';

export const SettingsRoutes = React.memo(({ projectId }: { projectId: string }) => (
  <ErrorBoundary>
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
      <Plugins path="plugins" />
    </Router>
  </ErrorBoundary>
));
