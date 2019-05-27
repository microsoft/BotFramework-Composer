/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Link } from '@reach/router';
import { PropTypes } from 'prop-types';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';

import { link, outer, iconButton, commandBarButton } from './styles';

export const NavItem = props => {
  const { to, exact, labelHide, iconName, labelName } = props;
  return (
    <Link
      to={to}
      tabIndex={-1}
      style={link}
      getProps={({ isCurrent, isPartiallyCurrent }) => {
        const activeStyle = { style: { ...link, color: '#0083cb' } };
        const isActive = exact ? isCurrent : isPartiallyCurrent;
        return isActive ? activeStyle : null;
      }}
    >
      <div tabIndex={-1} css={outer(!labelHide)}>
        {labelHide ? (
          <IconButton iconProps={{ iconName }} styles={iconButton} />
        ) : (
          <CommandBarButton iconProps={{ iconName }} text={labelName} styles={commandBarButton} />
        )}
      </div>
    </Link>
  );
};

NavItem.propTypes = {
  to: PropTypes.string,
  iconName: PropTypes.string,
  labelName: PropTypes.string,
  exact: PropTypes.bool,
  labelHide: PropTypes.bool,
};
