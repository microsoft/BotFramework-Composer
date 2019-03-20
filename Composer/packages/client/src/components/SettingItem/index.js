/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';

import { label } from './styles';
import { NavLink } from './../NavLink';

export const SettingItem = props => (
  <NavLink
    to={props.to}
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
    <div css={label}>{props.label}</div>
  </NavLink>
);

SettingItem.propTypes = {
  to: PropTypes.string,
  label: PropTypes.string,
};
