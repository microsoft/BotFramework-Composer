import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { NotFound } from './components/NotFound';
import { DesignPage } from './pages/design';
import { SettingPage } from './pages/setting';

const Routes = () => (
  <Switch>
    <Route exact path="/" component={DesignPage} />
    <Route path="/setting" component={SettingPage} />
    <Route component={NotFound} />
  </Switch>
);

export default Routes;
