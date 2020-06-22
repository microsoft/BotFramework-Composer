// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { Router, Redirect } from '@reach/router';

import { ErrorBoundary } from '../../components/ErrorBoundary';

import { DialogSettings } from './dialog-settings';
import { AppSettings } from './app-settings';
import { RuntimeSettings } from './runtime-settings';
import { About } from '../about';

export const SettingsRoutes = () => (
  <ErrorBoundary>
    <Router>
      <Redirect noThrow from="/" to="/settings/application" />
      <AppSettings default path="application" />
      <About path="about" />
      <DialogSettings path="/bot/:projectId/dialog-settings" />
      <RuntimeSettings path="/bot/:projectId/runtime" />
    </Router>
  </ErrorBoundary>
);
