import React from 'react';
import { Router, Redirect } from '@reach/router';

import { NotFound } from './components/NotFound';
import DesignPage from './pages/design';
import { SettingPage } from './pages/setting';
import { ContentPage } from './pages/content/index';

const Routes = () => (
  <Router>
    <DesignPage path="/" />
    <ContentPage path="content" />
    <Redirect from="setting" to="setting/dialog-settings" noThrow />
    <SettingPage path="setting/*" />
    <NotFound default />
  </Router>
);

export default Routes;
