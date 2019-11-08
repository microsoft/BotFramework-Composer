// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useContext, useEffect, Suspense } from 'react';
import { Router, Match, Redirect } from '@reach/router';

import DesignPage from './pages/design';
import { Home } from './pages/home';
import { About } from './pages/about';
import { showDesign, data } from './styles';
import { NotFound } from './components/NotFound';
import { BASEPATH } from './constants';
import { StoreContext } from './store';
import { resolveToBasePath } from './utils/fileUtil';
import { LoadingSpinner } from './components/LoadingSpinner';

const LUPage = React.lazy(() => import('./pages/language-understanding'));
const LGPage = React.lazy(() => import('./pages/language-generation'));
const SettingPage = React.lazy(() => import('./pages/setting'));

const Routes = props => {
  const { actions } = useContext(StoreContext);
  const Content = props.component;
  const parentProps = props;

  useEffect(() => {
    actions.fetchProject();
  }, []);

  return (
    <Match path={resolveToBasePath(BASEPATH, '/dialogs/:dialogId/*')} {...props}>
      {({ match, navigate, location }) => (
        <div css={data}>
          <Content css={showDesign(match)}>
            <DesignPage match={match} navigate={navigate} location={location} />
          </Content>
          {!match && (
            <Suspense fallback={<LoadingSpinner />}>
              <Router basepath={BASEPATH} {...parentProps}>
                <Redirect from="/" to={resolveToBasePath(BASEPATH, 'dialogs/Main')} noThrow />
                <SettingPage path="setting/*" />
                <LUPage path="language-understanding/*" />
                <LGPage path="language-generation/*" />
                <Home path="home" />
                <About path="about" />
                <NotFound default />
              </Router>
            </Suspense>
          )}
        </div>
      )}
    </Match>
  );
};

export default Routes;
