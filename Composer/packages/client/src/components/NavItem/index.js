import { Icon } from 'office-ui-fabric-react/lib/Icon';
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';

import { outer, icon, label } from './styles';

export const NavItem = props => (
  <div tabIndex={0} css={outer}>
    <div css={icon}>
      <Icon iconName={props.iconName} />
    </div>
    <div css={label}>{props.label}</div>
  </div>
);

NavItem.propTypes = {
  iconName: PropTypes.string,
  label: PropTypes.string,
};
