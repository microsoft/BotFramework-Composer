/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import formatMessage from 'format-message';

import Routes from './router';
import { Tree } from './../../components/Tree/index';
import { Conversation } from './../../components/Conversation/index';
import { NavLink } from './../../components/NavLink/index';
import { title, label, navLinkClass } from './styles';

// todo: should wrap the NavLink to another component.
export const ContentPage = () => {
  return (
    <Fragment>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, marginLeft: '30px', marginTop: '20px' }}>
          <Tree variant="largest">
            <div>
              <div css={title}>{formatMessage('Content')}</div>
              <NavLink to={'lu'} style={navLinkClass.default} activestyle={navLinkClass.activestyle}>
                <div css={label}>{formatMessage('Language Understanding')}</div>
              </NavLink>
              <NavLink to={'lg'} style={navLinkClass.default} activestyle={navLinkClass.activestyle}>
                <div css={label}>{formatMessage('Language Generation')}</div>
              </NavLink>
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
