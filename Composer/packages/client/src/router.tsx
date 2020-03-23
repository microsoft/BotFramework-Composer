// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment, useContext, useEffect, Suspense } from 'react';
import { Router, Redirect } from '@reach/router';

import { About } from './pages/about';
import { data } from './styles';
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
  return (
    <div css={data}>
      <Suspense fallback={<LoadingSpinner />}>
        <Router basepath={BASEPATH} {...props}>
          {/* <!-- this is out here, instead of inside ProjectRouter, to allow for a specific place in the DOM. --> */}
          <DialogRouter path="/bot/:projectId/dialogs/:dialogId/*" {...props} />
          <Redirect
            from="/bot/:projectId/language-generation"
            to="/bot/:projectId/language-generation/common"
            noThrow
          />
          <Redirect
            from="/bot/:projectId/language-understanding"
            to="/bot/:projectId/language-understanding/all"
            noThrow
          />
          <Redirect from="/" to={resolveToBasePath(BASEPATH, 'home')} noThrow />
          <ProjectRouter path="/bot/:projectId">
            <SettingPage path="setting/*" />
            <LUPage path="language-understanding/:fileId/*" />
            <LGPage path="language-generation/:fileId/*" />
            <Notifications path="notifications" />
          </ProjectRouter>
          <Home path="home" />
          <About path="about" />
          <NotFound default />
        </Router>
      </Suspense>
    </div>
  );
};

const DialogRouter = props => {
  const match = { dialogId: props.dialogId, projectId: props.projectId };
  const { actions } = useContext(StoreContext);

  useEffect(() => {
    actions.fetchProjectById(props.projectId);
  }, []);

  return (
    <Fragment>
      <DesignPage match={match} {...props} />
    </Fragment>
  );
};

const ProjectRouter = props => {
  const { actions } = useContext(StoreContext);

  useEffect(() => {
    actions.fetchProjectById(props.projectId);
  }, []);

  return <Fragment>{props.children}</Fragment>;
};

export default Routes;
