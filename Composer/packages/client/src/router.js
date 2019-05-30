import React from 'react';
import { Router } from '@reach/router';

import { NotFound } from './components/NotFound';
import DesignPage from './pages/design';
import { SettingPage } from './pages/setting';
import { LUPage } from './pages/language-understanding';
import { LGPage } from './pages/language-generation';

const Routes = () => (
  <Router>
    <DesignPage path="/" />
    <SettingPage path="setting/*" />
    <LUPage path="language-understanding/:fileId" />
    <LGPage path="language-generation/:fileId" />
    <NotFound default />
  </Router>
);

export default Routes;
