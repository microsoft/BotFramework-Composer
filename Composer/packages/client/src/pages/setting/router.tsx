// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Router } from '@reach/router';

import { ErrorBoundary } from '../../components/ErrorBoundary';

import { DialogSettings } from './dialog-settings';
import { UserSettings } from './user-settings';
import { RuntimeSettings } from './runtime-settings';

const Routes = () => {
  return (
    <ErrorBoundary>
      <Router>
        <DialogSettings default path="dialog-settings" />
        <UserSettings path="preferences" />
        <RuntimeSettings path="runtime" />
      </Router>
    </ErrorBoundary>
  );
};

export default Routes;
