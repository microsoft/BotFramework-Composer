// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useEffect, useRef, Suspense } from 'react';
import { Router, Match, Redirect } from '@reach/router';

import { About } from './pages/about';
import { showDesign, data } from './styles';
import { NotFound } from './components/NotFound';
import { BASEPATH } from './constants';
import { StoreContext } from './store';
import { resolveToBasePath } from './utils/fileUtil';
import { LoadingSpinner } from './components/LoadingSpinner';

const Home = React.lazy(() => import('./pages/home'));
const DesignPage = React.lazy(() => import('./pages/design'));
const LUPage = React.lazy(() => import('./pages/language-understanding'));
const LGPage = React.lazy(() => import('./pages/language-generation'));
const SettingPage = React.lazy(() => import('./pages/setting'));
const Notifications = React.lazy(() => import('./pages/notifications'));

const Routes = props => {
  const { actions } = useContext(StoreContext);
  const Content = props.component;
  const parentProps = props;
  const shouldRenderDesignPage = useRef(false);

  useEffect(() => {
    actions.fetchProject();
  }, []);

  return (
    <Match path={resolveToBasePath(BASEPATH, '/dialogs/:dialogId/*')} {...props}>
      {({ match, navigate, location }) => {
        if (match) {
          shouldRenderDesignPage.current = true;
        }

        return (
          <div css={data}>
            <Suspense fallback={<LoadingSpinner />}>
              <Content css={showDesign(match)}>
                {shouldRenderDesignPage.current && <DesignPage match={match} navigate={navigate} location={location} />}
              </Content>
              {!match && (
                <Router basepath={BASEPATH} {...parentProps}>
                  <Redirect from="/" to={resolveToBasePath(BASEPATH, 'dialogs/Main')} noThrow />
                  <SettingPage path="setting/*" />
                  <Redirect from="language-understanding" to="language-understanding/all" noThrow />
                  <LUPage path="language-understanding/:fileId/*" />
                  <Redirect from="language-generation" to="language-generation/common" noThrow />
                  <LGPage path="language-generation/:fileId/*" />
                  <Notifications path="notifications" />
                  <Home path="home" />
                  <About path="about" />
                  <NotFound default />
                </Router>
              )}
            </Suspense>
          </div>
        );
      }}
    </Match>
  );
};

export default Routes;
