/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';

import Routes from './router';
import { Tree } from './../../components/Tree/index';
import { Conversation } from './../../components/Conversation/index';
import { NavLink } from './../../components/NavLink/index';
import { title, label } from './styles';

// todo: should wrap the NavLink to another component.
export const ContentPage = () => {
  return (
    <Fragment>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, marginLeft: '30px', marginTop: '20px' }}>
          <Tree variant="largest">
            <div>
              <div css={title}>Content</div>
              <NavLink
                to={'lu'}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  color: '#5f5f5f',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  lineHeight: '30px',
                  paddingLeft: '15px',
                }}
                activestyle={{ color: '#0083cb' }}
              >
                <div css={label}>{'Language Understanding'}</div>
              </NavLink>
              <NavLink
                to={'lg'}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  color: '#5f5f5f',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  lineHeight: '30px',
                  paddingLeft: '15px',
                }}
                activestyle={{ color: '#0083cb' }}
              >
                <div css={label}>{'Language Generation'}</div>
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
