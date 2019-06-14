/** @jsx jsx */
import { jsx } from '@emotion/core';
import { forwardRef } from 'react';
import { Fragment, useContext, useEffect, useState } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import lodash from 'lodash';

import { Header } from './components/Header';
import { NavItem } from './components/NavItem';
import { StorageExplorer } from './StorageExplorer';
import Routes from './router';
import { Store } from './store/index';
import { main, sideBar, content, divider, globalNav } from './styles';

initializeIcons(/* optional base url */);

// eslint-disable-next-line react/display-name
const Content = forwardRef((props, ref) => <div css={content} {...props} ref={ref} />);

export function App() {
  const { state, actions } = useContext(Store);
  const [sideBarExpand, setSideBarExpand] = useState('');
  const { botStatus, botLoadErrorMsg } = state;
  const { connectBot, reloadBot, setStorageExplorerStatus } = actions;
  useEffect(() => {
    actions.fetchProject();
  }, []);

  const initLinks = [
    {
      //index: 0,
      to: '/',
      iconName: 'SplitObject',
      labelName: formatMessage('Flow design'),
      labelHide: !sideBarExpand,
      selected: true,
    },
    {
      //index: 1,
      to: 'language-understanding/all',
      iconName: 'People',
      labelName: formatMessage('User says'),
      labelHide: !sideBarExpand,
      selected: false,
    },
    {
      //index: 2,
      to: 'language-generation/all',
      iconName: 'Robot',
      labelName: formatMessage('Bot says'),
      labelHide: !sideBarExpand,
      selected: false,
    },
    {
      //index: 3,
      to: 'setting',
      iconName: 'Settings',
      labelName: formatMessage('Settings'),
      labelHide: !sideBarExpand,
      selected: false,
    },
  ];

  const [links, setLinks] = useState(initLinks);

  const onClickLink = clickedLinkIndex => {
    const newLinks = lodash.cloneDeep(links);
    newLinks.forEach(link => {
      link.selected = false;
    });
    newLinks[clickedLinkIndex].selected = true;
    setLinks(newLinks);
  };
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
          <IconButton
            iconProps={{ iconName: 'GlobalNavButton' }}
            css={globalNav}
            onClick={() => {
              setSideBarExpand(!sideBarExpand);
            }}
          />
          <div css={divider} />
          {links.map((link, index) => {
            return (
              <NavItem
                key={index}
                to={link.to}
                iconName={link.iconName}
                labelName={link.labelName}
                labelHide={!sideBarExpand}
                onClick={onClickLink}
                index={index}
                selected={link.selected}
              />
            );
          })}
<<<<<<< HEAD
          {/* <NavItem
            to="/"
            exact={true}
            iconName="SplitObject"
            labelName={formatMessage('Flow design')}
            labelHide={!sideBarExpand}
          />
          <NavItem
            to="language-generation/"
            iconName="Robot"
            labelName={formatMessage('Bot says')}
            labelHide={!sideBarExpand}
          />
          <NavItem
            to="language-understanding/all"
            iconName="People"
            labelName={formatMessage('User says')}
            labelHide={!sideBarExpand}
          />
          <NavItem to="setting" iconName="Settings" labelName={formatMessage('Settings')} labelHide={!sideBarExpand} /> */}
=======
>>>>>>> create local state to record the selected link
        </div>
        <Routes component={Content} />
      </div>
    </Fragment>
  );
}
