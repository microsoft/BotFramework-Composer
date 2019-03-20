import { Icon } from 'office-ui-fabric-react/lib/Icon';
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';

import { outer, icon, label } from './styles';
import { NavLink } from './../NavLink';

export const NavItem = props => (
  <NavLink
    to={props.to}
    exact={props.exact}
    style={{ display: 'block', textDecoration: 'none', color: '#4f4f4f' }}
    activestyle={{ color: '#0083cb' }}
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
  exact: PropTypes.bool,
};
