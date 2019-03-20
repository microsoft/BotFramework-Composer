/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';

import Routes from './router';
import { Tree } from './../../components/Tree/index';
import { Conversation } from './../../components/Conversation/index';
import { SettingItem } from './../../components/SettingItem';
import { title } from './styles';

export const SettingPage = () => {
  return (
    <Fragment>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, marginLeft: '30px', marginTop: '20px' }}>
          <Tree variant="largest">
            <div>
              <div css={title}>Settings</div>
              <SettingItem to="dialog-settings" label="Dialog settings" />
              <SettingItem to="services" label="Services" />
              <SettingItem to="composer-configuration" label="Composer configuration" />
              <SettingItem to="publishing-staging" label="Publishing and staging" />
            </div>
          </Tree>
        </div>
        <div style={{ flex: 4, marginTop: '20px', marginLeft: '20px' }}>
          <Conversation>
            <Routes />
          </Conversation>
        </div>
      </div>
    </Fragment>
  );
};
