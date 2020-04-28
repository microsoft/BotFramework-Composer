// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Router } from '@reach/router';

import { ErrorBoundary } from '../../components/ErrorBoundary';

import { DialogSettings } from './dialog-settings';
import { RemotePublish } from './remote-publish';
import { Deployment } from './deployment';
import { UserSettings } from './user-settings';
import { RuntimeSettings } from './runtime-settings';

const Routes = () => {
  return (
    <ErrorBoundary>
      <Router>
        <DialogSettings path="dialog-settings" default />
        <Deployment path="deployment" />
        <RemotePublish path="remote-publish" />
        <UserSettings path="preferences" />
        <RuntimeSettings path="runtime" />
      </Router>
    </ErrorBoundary>
  );
};

export default Routes;
