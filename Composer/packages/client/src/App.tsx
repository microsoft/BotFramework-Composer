// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { forwardRef, useContext, useEffect, useState, Fragment, Suspense } from 'react';
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
import { ErrorBoundary } from './components/ErrorBoundary';
import { RequireAuth } from './components/RequireAuth';
import onboardingState from './utils/onboardingStorage';
import { isElectron } from './utils/electronUtil';
import { useLinks } from './utils/hooks';

initializeIcons(undefined, { disableWarnings: true });

const Onboarding = React.lazy(() => import('./Onboarding'));
const AppUpdater = React.lazy(() =>
  import('./components/AppUpdater').then((module) => ({ default: module.AppUpdater }))
);

// eslint-disable-next-line react/display-name
const Content = forwardRef<HTMLDivElement>((props, ref) => <div css={content} {...props} ref={ref} />);

export const App: React.FC = () => {
  const { actions, state } = useContext(StoreContext);
  const [sideBarExpand, setSideBarExpand] = useState(false);

  const { onboardingSetComplete } = actions;
  const { botName, locale, announcement } = state;
  const { topLinks, bottomLinks } = useLinks();

  useEffect(() => {
    onboardingSetComplete(onboardingState.getComplete());
  }, []);

  const mapNavItemTo = (x) => resolveToBasePath(BASEPATH, x);

  const renderAppUpdater = isElectron();

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
              {topLinks.map((link, index) => {
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
              <Routes component={Content} />
            </RequireAuth>
          </ErrorBoundary>
        </div>
        <Suspense fallback={<div />}>{!state.onboarding.complete && <Onboarding />}</Suspense>
        <Suspense fallback={<div />}>{renderAppUpdater && <AppUpdater />}</Suspense>
      </div>
    </Fragment>
  );
};
