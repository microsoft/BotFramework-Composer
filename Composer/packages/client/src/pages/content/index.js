import React, { Fragment } from 'react';

import { Tree } from './../../components/Tree/index';
import { Conversation } from './../../components/Conversation/index';

export const ContentPage = () => {
  return (
    <Fragment>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, marginLeft: '30px', marginTop: '20px' }}>
          <Tree variant="largest">
            <div>Content</div>
          </Tree>
        </div>
        <div style={{ flex: 4, marginTop: '20px', marginLeft: '20px' }}>
          <Conversation />
        </div>
      </div>
    </Fragment>
  );
};
