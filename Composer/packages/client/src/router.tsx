// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useContext, useEffect, Suspense } from 'react';
import { Router, Redirect, RouteComponentProps } from '@reach/router';

import { resolveToBasePath } from './utils/fileUtil';
import { About } from './pages/about';
import { data } from './styles';
import { NotFound } from './components/NotFound';
import { BASEPATH } from './constants';
import { StoreContext } from './store';
import { LoadingSpinner } from './components/LoadingSpinner';

const DesignPage = React.lazy(() => import('./pages/design'));
const LUPage = React.lazy(() => import('./pages/language-understanding'));
const LGPage = React.lazy(() => import('./pages/language-generation'));
const SettingPage = React.lazy(() => import('./pages/setting'));
const Notifications = React.lazy(() => import('./pages/notifications'));
const Publish = React.lazy(() => import('./pages/publish'));
const Skills = React.lazy(() => import('./pages/skills'));
const BotCreationFlowRouter = React.lazy(() => import('./components/CreationFlow'));

const Routes = props => {
  return (
    <div css={data}>
      <Suspense fallback={<LoadingSpinner />}>
        <Router basepath={BASEPATH} {...props}>
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
          <Redirect from="/bot/:projectId/publish" to="/bot/:projectId/publish/all" noThrow />
          <Redirect from="/" to={resolveToBasePath(BASEPATH, 'home')} noThrow />
          {/* <Redirect from="/bot/:projectId" to="/bot/:projectId/dialogs/Main" noThrow /> */}
          <ProjectRouter path="/bot/:projectId">
            <DesignPage path="dialogs/:dialogId/*" />
            <SettingPage path="settings/*" />
            <LUPage path="language-understanding/:dialogId/*" />
            <LGPage path="language-generation/:dialogId/*" />
            <Notifications path="notifications" />
            <Publish path="publish/:targetName" />
            <Skills path="skills/*" />
          </ProjectRouter>
          <BotCreationFlowRouter path="projects/*" />
          <BotCreationFlowRouter path="home" />
          <About path="about" />
          <NotFound default />
        </Router>
      </Suspense>
    </div>
  );
};

const projectStyle = css`
  height: 100%;

  & > div {
    height: 100%;
  }

  label: ProjectRouter;
`;

const ProjectRouter: React.FC<RouteComponentProps<{ projectId: string }>> = props => {
  const { actions, state } = useContext(StoreContext);

  useEffect(() => {
    if (state.projectId !== props.projectId) {
      actions.fetchProjectById(props.projectId);
    }
  }, []);

  return <div css={projectStyle}>{props.children}</div>;
};

export default Routes;
