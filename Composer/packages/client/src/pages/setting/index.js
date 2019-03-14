import React, { Fragment } from 'react';

import { Tree } from './../../components/Tree/index';
import { Conversation } from './../../components/Conversation/index';

export const SettingPage = () => {
  return (
    <Fragment>
      <div style={{ display: 'flex', height: '100%' }}>
        <Tree>
          <div>Setting</div>
        </Tree>
        <Conversation style={{ flex: 1, marginLeft: '15px', marginRight: '15px' }} />
      </div>
    </Fragment>
  );
};
