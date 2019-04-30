/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import formatMessage from 'format-message';

import Routes from './router';
import { Tree } from './../../components/Tree/index';
import { Conversation } from './../../components/Conversation/index';
import { SettingItem } from './../../components/SettingItem';
import { title, contentContainer, fileList, contentEditor } from './styles';

export const SettingPage = () => {
  return (
    <Fragment>
      <div css={contentContainer}>
        <div css={fileList}>
          <Tree variant="self-adaption">
            <div>
              <div css={title}>Settings</div>
              <SettingItem to="dialog-settings" label={formatMessage('Dialog settings')} />
              <SettingItem to="services" label={formatMessage('Services')} />
              <SettingItem to="composer-configuration" label={formatMessage('Composer configuration')} />
              <SettingItem to="publishing-staging" label={formatMessage('Publishing and staging')} />
            </div>
          </Tree>
        </div>
        <Conversation extraCss={contentEditor}>
          <Routes />
        </Conversation>
      </div>
    </Fragment>
  );
};
