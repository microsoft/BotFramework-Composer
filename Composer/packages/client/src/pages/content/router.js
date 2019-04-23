import React from 'react';
import { Router, Redirect } from '@reach/router';

import { LanguageUnderstandingSettings } from './lu-settings';
import { LanguageGenerationSettings } from './lg-settings';

const Routes = () => (
  <Router>
    <Redirect from="*" to="content/lg" noThrow />
    <LanguageUnderstandingSettings path="lu" />
    <LanguageGenerationSettings path="lg" />
  </Router>
);

export default Routes;
