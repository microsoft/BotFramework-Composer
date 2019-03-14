import React from 'react';
import { Router } from '@reach/router';

import { NotFound } from './components/NotFound';
import DesignPage from './pages/design';
import { SettingPage } from './pages/setting';
import { ContentPage } from './pages/content/index';

const Routes = () => (
  <Router style={{ height: '100%' }}>
    <DesignPage path="/" />
    <ContentPage path="/content" />
    <SettingPage path="/setting" />
    <NotFound default />
  </Router>
);

export default Routes;
