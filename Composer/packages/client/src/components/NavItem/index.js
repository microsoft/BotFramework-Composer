/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Link } from '@reach/router';
import { PropTypes } from 'prop-types';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { outer, icon, label, link } from './styles';

export const NavItem = props => {
  const { to, exact, isLabelHide, iconName, labelName } = props;
  return (
    <Link
      to={to}
      style={link}
      getProps={({ isCurrent, isPartiallyCurrent }) => {
        const activeStyle = { style: { ...link, color: '#0083cb' } };
        const isActive = exact ? isCurrent : isPartiallyCurrent;
        return isActive ? activeStyle : null;
      }}
    >
      <div css={outer}>
        <div css={icon}>
          <Icon iconName={iconName} />
        </div>
        <div css={label(isLabelHide)}>{labelName}</div>
      </div>
    </Link>
  );
};

NavItem.propTypes = {
  to: PropTypes.string,
  iconName: PropTypes.string,
  labelName: PropTypes.string,
  exact: PropTypes.bool,
  isLabelHide: PropTypes.bool,
};
