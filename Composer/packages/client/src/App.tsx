// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { forwardRef, useContext, useState, useCallback, Fragment, Suspense } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { FontSizes } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';

import { Header } from './components/Header';
import { BASEPATH } from './constants';
import Routes from './router';
import { StoreContext } from './store';
import { main, sideBar, content, divider, globalNav, leftNavBottom, rightPanel, dividerTop } from './styles';
import { resolveToBasePath } from './utils/fileUtil';
import { CreationFlow } from './CreationFlow';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RequireAuth } from './components/RequireAuth';
import { CreationFlowStatus } from './constants';
import { LoadingSpinner } from './components/LoadingSpinner';

initializeIcons(undefined, { disableWarnings: true });

const Onboarding = React.lazy(() => import('./Onboarding'));
// eslint-disable-next-line react/display-name
const Content = forwardRef<HTMLDivElement>((props, ref) => <div css={content} {...props} ref={ref} />);

const topLinks = (projectId: string) => {
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
      to: `/bot/${projectId}/dialogs/Main`,
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
      to: `/bot/${projectId}/setting/`,
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
  const { botName, projectId, creationFlowStatus } = state;
  const { setCreationFlowStatus } = actions;
  const mapNavItemTo = (x: string) => resolveToBasePath(BASEPATH, x);

  const {
    actions: { onboardingAddCoachMarkRef },
  } = useContext(StoreContext);

  const addRef = (name: string) =>
    useCallback(ref => onboardingAddCoachMarkRef({ [`nav${name.replace(' ', '')}`]: ref }), []);

  const makeIconLink = link => ({
    name: link.labelName,
    ariaLabel: link.labelName,
    iconProps: {
      iconName: link.iconName,
      componentRef: addRef(link.labelName),
      styles: {
        root: {
          fontSize: FontSizes.size16,
          paddingLeft: '8px',
        },
      },
    },
    url: mapNavItemTo(link.to),
    disabled: link.disabled,
  });

  return (
    <Fragment>
      <Header botName={botName} />
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
            <Nav
              ariaLabel={formatMessage('Navigation')}
              groups={[
                {
                  links: topLinks(projectId).map(makeIconLink),
                },
              ]}
            />
          </div>
          <div css={leftNavBottom}>
            <div css={divider(sideBarExpand)} />{' '}
            <Nav
              ariaLabel={formatMessage('Navigation')}
              groups={[
                {
                  links: bottomLinks.map(makeIconLink),
                },
              ]}
            />
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
        <Suspense fallback={<LoadingSpinner />}>{!state.onboarding.complete && <Onboarding />}</Suspense>
      </div>
    </Fragment>
  );
};
