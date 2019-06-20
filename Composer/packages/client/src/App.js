/** @jsx jsx */
import { jsx } from '@emotion/core';
import { forwardRef } from 'react';
import { Fragment, useContext, useEffect, useState } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

import { Header } from './components/Header';
import { NavItem } from './components/NavItem';
import { StorageExplorer } from './StorageExplorer';
import Routes from './router';
import { Store } from './store/index';
import { main, sideBar, content, divider, globalNav, leftNavBottom } from './styles';

initializeIcons(/* optional base url */);

// eslint-disable-next-line react/display-name
const Content = forwardRef((props, ref) => <div css={content} {...props} ref={ref} />);

const topLinks = [
  {
    to: '/home',
    iconName: 'Home',
    labelName: 'Home',
    activeIfUrlContains: '',
    exact: false,
    underTest: true, // will delete
  },
  {
    to: '/',
    iconName: 'SplitObject',
    labelName: 'Design Flow',
    activeIfUrlContains: '',
    exact: true,
  },
  {
    to: '/test-conversation',
    iconName: 'WaitListConfirm',
    labelName: 'Test Conversation',
    activeIfUrlContains: '',
    exact: false,
    underTest: true, // will delete
  },
  {
    to: 'language-generation/',
    iconName: 'Robot',
    labelName: 'Bot Says',
    activeIfUrlContains: 'language-generation',
    exact: false,
  },
  {
    to: 'language-understanding/all',
    iconName: 'People',
    labelName: 'User says',
    activeIfUrlContains: 'language-understanding',
    exact: false,
  },
  {
    to: '/evaluate-performance',
    iconName: 'Chart',
    labelName: 'Evaluate performance',
    activeIfUrlContains: '',
    exact: false,
    underTest: true, // will delete
  },
  {
    to: 'setting',
    iconName: 'Settings',
    labelName: 'Settings',
    activeIfUrlContains: 'setting',
    exact: false,
  },
];

const bottomLinks = [
  {
    to: '/help',
    iconName: 'unknown',
    labelName: 'Help',
    activeIfUrlContains: '/help',
    exact: false,
    underTest: true, // will delete
  },
  {
    to: '/about',
    iconName: 'info',
    labelName: 'About',
    activeIfUrlContains: '/about',
    exact: false,
    underTest: true, // will delete
  },
];

export function App() {
  const { state, actions } = useContext(Store);
  const [sideBarExpand, setSideBarExpand] = useState('');
  const { botStatus, botLoadErrorMsg } = state;
  const { connectBot, reloadBot, setStorageExplorerStatus } = actions;
  useEffect(() => {
    actions.fetchProject();
  }, []);

  return (
    <Fragment>
      <Header
        botStatus={botStatus}
        connectBot={connectBot}
        reloadBot={reloadBot}
        botLoadErrorMsg={botLoadErrorMsg}
        openStorageExplorer={setStorageExplorerStatus}
      />
      <StorageExplorer />
      <div css={main}>
        <div css={sideBar(sideBarExpand)}>
          <div>
            <IconButton
              iconProps={{ iconName: 'GlobalNavButton' }}
              css={globalNav}
              onClick={() => {
                setSideBarExpand(!sideBarExpand);
              }}
              data-testid={'LeftNavButton'}
            />
            <div css={divider} />
            {topLinks.map((link, index) => {
              return (
                <NavItem
                  key={'NavLeftBar' + index}
                  to={link.to}
                  iconName={link.iconName}
                  labelName={link.labelName}
                  labelHide={!sideBarExpand}
                  index={index}
                  exact={link.exact}
                  targetUrl={link.activeIfUrlContains}
                  underTest={link.underTest}
                />
              );
            })}
          </div>
          <div css={leftNavBottom}>
            <div css={divider} />
            {bottomLinks.map((link, index) => {
              return (
                <NavItem
                  key={'NavLeftBar' + index}
                  to={link.to}
                  iconName={link.iconName}
                  labelName={link.labelName}
                  labelHide={!sideBarExpand}
                  index={index}
                  exact={link.exact}
                  targetUrl={link.activeIfUrlContains}
                  underTest={link.underTest}
                />
              );
            })}
          </div>
        </div>
        <Routes component={Content} />
      </div>
    </Fragment>
  );
}
