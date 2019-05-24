/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useContext, useEffect, useState } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';

import { Header } from './components/Header';
import { NavItem } from './components/NavItem';
import { StorageExplorer } from './StorageExplorer';
import Routes from './router';
import { Store } from './store/index';
import { main, sideBar, content, divider, globalNav } from './styles';

initializeIcons(/* optional base url */);

export function App() {
  const { state, actions } = useContext(Store);
  const [sideBarSpread, setSideBarSpread] = useState('');
  const { botStatus } = state;
  const { toggleBot, setStorageExplorerStatus } = actions;
  useEffect(() => {
    actions.fetchProject();
  }, []);

  return (
    <Fragment>
      <Header
        botStatus={botStatus}
        setBotStatus={status => {
          toggleBot(status);
        }}
        openStorageExplorer={setStorageExplorerStatus}
      />
      <StorageExplorer />
      <div css={main}>
        <div css={sideBar(sideBarSpread)}>
          <Icon
            iconName="GlobalNavButton"
            css={globalNav}
            onClick={() => {
              setSideBarSpread(!sideBarSpread);
            }}
          />
          <div css={divider} />
          <NavItem
            to="/"
            exact={true}
            iconName="SplitObject"
            labelName={formatMessage('Flow design')}
            isLabelHide={!sideBarSpread}
          />
          <NavItem to="lg" iconName="Robot" labelName={formatMessage('Bot says')} isLabelHide={!sideBarSpread} />
          <NavItem to="lu" iconName="People" labelName={formatMessage('User says')} isLabelHide={!sideBarSpread} />
          <NavItem
            to="setting"
            iconName="Settings"
            labelName={formatMessage('Settings')}
            isLabelHide={!sideBarSpread}
          />
        </div>
        <div css={content}>
          <Routes />
        </div>
      </div>
    </Fragment>
  );
}
