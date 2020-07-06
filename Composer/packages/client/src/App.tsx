// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { forwardRef, useContext, useEffect, useState, Fragment, Suspense } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { FocusZone } from 'office-ui-fabric-react/lib/FocusZone';
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';
import formatMessage from 'format-message';

import { Header } from './components/Header/Header';
import { NavItem } from './components/NavItem/NavItem';
import { BASEPATH } from './constants';
import Routes from './router';
import { StoreContext } from './store';
import { main, sideBar, content, divider, globalNav, leftNavBottom, rightPanel, dividerTop } from './styles';
import { resolveToBasePath } from './utils/fileUtil';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { RequireAuth } from './components/RequireAuth/RequireAuth';
import onboardingState from './utils/onboardingStorage';
import { isElectron } from './utils/electronUtil';
import { useLinks } from './utils/hooks';

initializeIcons(undefined, { disableWarnings: true });

const Onboarding = React.lazy(() => import('./Onboarding/Onboarding'));
const AppUpdater = React.lazy(() =>
  import('./components/AppUpdater/AppUpdater').then((module) => ({ default: module.AppUpdater }))
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
    actions.fetchPlugins();
  }, []);

  const mapNavItemTo = (relPath: string) => resolveToBasePath(BASEPATH, relPath);

  const renderAppUpdater = isElectron();

  const globalNavButtonText = sideBarExpand ? formatMessage('Collapse Navigation') : formatMessage('Expand Navigation');
  const showTooltips = (link) => !sideBarExpand && !link.disabled;

  return (
    <Fragment>
      <div
        aria-live="assertive"
        role="alert"
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
            <TooltipHost content={globalNavButtonText} directionalHint={DirectionalHint.rightCenter}>
              <IconButton
                ariaLabel={globalNavButtonText}
                css={globalNav}
                data-testid={'LeftNavButton'}
                iconProps={{
                  iconName: 'GlobalNavButton',
                }}
                onClick={() => {
                  setSideBarExpand((current) => !current);
                }}
              />
            </TooltipHost>
            <div css={dividerTop} />{' '}
            <FocusZone allowFocusRoot>
              {topLinks.map((link, index) => {
                return (
                  <NavItem
                    key={'NavLeftBar' + index}
                    disabled={link.disabled}
                    exact={link.exact}
                    iconName={link.iconName}
                    labelName={link.labelName}
                    showTooltip={showTooltips(link)}
                    to={mapNavItemTo(link.to)}
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
                  disabled={link.disabled}
                  exact={link.exact}
                  iconName={link.iconName}
                  labelName={link.labelName}
                  showTooltip={showTooltips(link)}
                  to={mapNavItemTo(link.to)}
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
