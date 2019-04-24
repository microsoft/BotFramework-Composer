import React from 'react';
import { Router } from '@reach/router';

import { NotFound } from './components/NotFound';
import DesignPage from './pages/design';
import { SettingPage } from './pages/setting';
import { ContentPage } from './pages/content/index';

const Routes = () => (
  <Router>
    <DesignPage path="/" />
    <SettingPage path="setting/*" />
    <ContentPage path="content/*" />
    <NotFound default />
  </Router>
);

export default Routes;
