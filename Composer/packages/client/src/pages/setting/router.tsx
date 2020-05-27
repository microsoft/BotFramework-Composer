// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Router, Redirect } from '@reach/router';

import { ErrorBoundary } from '../../components/ErrorBoundary';

import { DialogSettings } from './dialog-settings';
import { AppSettings } from './app-settings';
import { RuntimeSettings } from './runtime-settings';

const getRedirect = () => {
  const { pathname } = location;

  const path = pathname.endsWith('/') ? pathname.substring(0, pathname.length - 1) : pathname;
  return `${path}/dialog-settings`;
};

const Routes = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Redirect noThrow from="/" to={getRedirect()} />
        <DialogSettings default path="dialog-settings" />
        <AppSettings path="preferences" />
        <RuntimeSettings path="runtime" />
      </Router>
    </ErrorBoundary>
  );
};

export default Routes;
