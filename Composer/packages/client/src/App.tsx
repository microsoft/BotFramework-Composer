// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { forwardRef, useContext, useState, Fragment, Suspense } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { FocusZone } from 'office-ui-fabric-react/lib/FocusZone';
import formatMessage from 'format-message';

import { Header } from './components/Header';
import { NavItem } from './components/NavItem';
import { BASEPATH } from './constants';
import Routes from './router';
import { StoreContext } from './store';
import { main, sideBar, content, divider, globalNav, leftNavBottom, rightPanel, dividerTop } from './styles';
import { resolveToBasePath } from './utils/fileUtil';
import { CreationFlow } from './CreationFlow';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RequireAuth } from './components/RequireAuth';
import { CreationFlowStatus } from './constants';
import { AppUpdater } from './components/AppUpdater';

initializeIcons(undefined, { disableWarnings: true });

const Onboarding = React.lazy(() => import('./Onboarding'));

// eslint-disable-next-line react/display-name
const Content = forwardRef<HTMLDivElement>((props, ref) => <div css={content} {...props} ref={ref} />);

const topLinks = (projectId: string, openedDialogId: string) => {
  const botLoaded = !!projectId;
  let links = [
    {
      to: '/home',
      iconName: 'Home',
      labelName: formatMessage('Home'),
      exact: true,
      disabled: false,
    },
    {
      to: `/bot/${projectId}/dialogs/${openedDialogId}`,
      iconName: 'SplitObject',
      labelName: formatMessage('Design Flow'),
      exact: false,
      disabled: !botLoaded,
    },
    // {
    //   to: '/test-conversation',
    //   iconName: 'WaitListConfirm',
    //   labelName: formatMessage('Test Conversation'),
    //   exact: false,
    //   disabled: true, // will delete
    // },
    {
      to: `/bot/${projectId}/language-generation`,
      iconName: 'Robot',
      labelName: formatMessage('Bot Responses'),
      exact: false,
      disabled: !botLoaded,
    },
    {
      to: `/bot/${projectId}/language-understanding`,
      iconName: 'People',
      labelName: formatMessage('User Input'),
      exact: false,
      disabled: !botLoaded,
    },
    // {
    //   to: '/evaluate-performance',
    //   iconName: 'Chart',
    //   labelName: formatMessage('Evaluate performance'),
    //   exact: false,
    //   disabled: true,
    // },
    {
      to: `/bot/${projectId}/notifications`,
      iconName: 'Warning',
      labelName: formatMessage('Notifications'),
      exact: true,
      disabled: !botLoaded,
    },
    {
      to: `/bot/${projectId}/publish`,
      iconName: 'CloudUpload',
      labelName: formatMessage('Publish'),
      exact: true,
      disabled: !botLoaded,
    },
    {
      to: `/bot/${projectId}/skills`,
      iconName: 'PlugDisconnected',
      labelName: formatMessage('Skills'),
      exact: true,
      disabled: !botLoaded,
    },
    {
      to: `/bot/${projectId}/settings/`,
      iconName: 'Settings',
      labelName: formatMessage('Settings'),
      exact: false,
      disabled: !botLoaded,
    },
  ];

  if (process.env.COMPOSER_AUTH_PROVIDER === 'abs-h') {
    links = links.filter(link => link.to !== '/home');
  }

  return links;
};

const bottomLinks = [
  // {
  //   to: '/help',
  //   iconName: 'unknown',
  //   labelName: formatMessage('Info'),
  //   exact: true,
  //   disabled: true,
  // },
  {
    to: '/about',
    iconName: 'info',
    labelName: formatMessage('About'),
    exact: true,
    disabled: false,
  },
];

export const App: React.FC = () => {
  const { state, actions } = useContext(StoreContext);
  const [sideBarExpand, setSideBarExpand] = useState(false);

  const { botName, projectId, dialogs, creationFlowStatus, locale, designPageLocation, announcement } = state;
  const { setCreationFlowStatus } = actions;
  const mapNavItemTo = x => resolveToBasePath(BASEPATH, x);

  const openedDialogId = designPageLocation.dialogId || dialogs.find(({ isRoot }) => isRoot === true)?.id || 'Main';
  return (
    <Fragment>
      <div
        role="alert"
        aria-live="assertive"
        style={{
          display: 'block',
          position: 'absolute',
          top: '-9999px',
          height: '1px',
          width: '1px',
        }}
      >
        {announcement}
      </div>
      <Header botName={botName} locale={locale} />
      <div css={main}>
        <nav css={sideBar(sideBarExpand)}>
          <div>
            <IconButton
              iconProps={{
                iconName: 'GlobalNavButton',
              }}
              css={globalNav}
              onClick={() => {
                setSideBarExpand(!sideBarExpand);
              }}
              data-testid={'LeftNavButton'}
              ariaLabel={sideBarExpand ? formatMessage('Collapse Nav') : formatMessage('Expand Nav')}
            />
            <div css={dividerTop} />{' '}
            <FocusZone allowFocusRoot={true}>
              {topLinks(projectId, openedDialogId).map((link, index) => {
                return (
                  <NavItem
                    key={'NavLeftBar' + index}
                    to={mapNavItemTo(link.to)}
                    iconName={link.iconName}
                    labelName={link.labelName}
                    exact={link.exact}
                    disabled={link.disabled}
                  />
                );
              })}
            </FocusZone>
          </div>
          <div css={leftNavBottom}>
            <div css={divider(sideBarExpand)} />{' '}
            {bottomLinks.map((link, index) => {
              return (
                <NavItem
                  key={'NavLeftBar' + index}
                  to={mapNavItemTo(link.to)}
                  iconName={link.iconName}
                  labelName={link.labelName}
                  exact={link.exact}
                  disabled={link.disabled}
                />
              );
            })}
          </div>
        </nav>
        <div css={rightPanel}>
          <ErrorBoundary>
            <RequireAuth>
              {creationFlowStatus !== CreationFlowStatus.CLOSE && (
                <CreationFlow creationFlowStatus={creationFlowStatus} setCreationFlowStatus={setCreationFlowStatus} />
              )}
              <Routes component={Content} />
            </RequireAuth>
          </ErrorBoundary>
        </div>
        <Suspense fallback={<div />}>{!state.onboarding.complete && <Onboarding />}</Suspense>
        {(window as any).__IS_ELECTRON__ && <AppUpdater />}
      </div>
    </Fragment>
  );
};
