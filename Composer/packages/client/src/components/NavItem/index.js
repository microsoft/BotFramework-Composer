import { Icon } from 'office-ui-fabric-react/lib/Icon';
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';

import { NavLink } from './../NavLink';
import { link } from './styles';

export const NavItem = props => (
  <NavLink to={props.to} css={link} activestyle={{ background: '#fff' }}>
    <Icon iconName={props.iconName} />
  </NavLink>
);

NavItem.propTypes = {
  to: PropTypes.string,
  iconName: PropTypes.string,
  label: PropTypes.string,
};
