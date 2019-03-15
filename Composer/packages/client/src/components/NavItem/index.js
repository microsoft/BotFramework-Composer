import { Icon } from 'office-ui-fabric-react/lib/Icon';
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';

import { outer, icon, label } from './styles';
import { NavLink } from './../NavLink';

export const NavItem = props => (
  <NavLink
    to={props.to}
    style={{ display: 'block', textDecoration: 'none' }}
    activestyle={{ display: 'block', textDecoration: 'none', outline: '2px solid', color: '#0083cb99' }}
  >
    <div css={outer}>
      <div css={icon}>
        <Icon iconName={props.iconName} />
      </div>
      <div css={label}>{props.label}</div>
    </div>
  </NavLink>
);

NavItem.propTypes = {
  to: PropTypes.string,
  iconName: PropTypes.string,
  label: PropTypes.string,
};
