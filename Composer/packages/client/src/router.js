import React from 'react';
import { Router } from '@reach/router';

import { NotFound } from './components/NotFound';
import DesignPage from './pages/design';
import { SettingPage } from './pages/setting';
import { ContentPage } from './pages/content/index';
import { LanguageUnderstanding } from './pages/user/index';

const Routes = () => (
  <Router>
    <DesignPage path="/" />
    <SettingPage path="setting/*" />
    <ContentPage path="lg" />
    <LanguageUnderstanding path="lu" />
    <NotFound default />
  </Router>
);

export default Routes;
