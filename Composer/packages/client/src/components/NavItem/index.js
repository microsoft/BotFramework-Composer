/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Link } from '@reach/router';
import { PropTypes } from 'prop-types';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { Fragment } from 'react';

import { link, outer, iconButton, commandBarButton, lockedBar } from './styles';

export const NavItem = props => {
  const { to, labelHide, iconName, labelName, selected, onClick, index } = props;
  return (
    <Link
      to={to}
      tabIndex={-1}
      style={link}
      // getProps={({ isCurrent, isPartiallyCurrent }) => {
      //   const activeStyle = { style: { ...link, backgroundColor: '#E1DFDD' } };
      //   const isActive = exact ? isCurrent : isPartiallyCurrent;
      //   return isActive ? activeStyle : null;
      // }}
    >
      <div
        tabIndex={-1}
        css={outer(!labelHide)}
        onClick={() => {
          onClick(index);
        }}
      >
        {labelHide ? (
          <IconButton iconProps={{ iconName }} styles={iconButton} />
        ) : (
          <Fragment>
            {selected && <div css={lockedBar} />}
            <CommandBarButton iconProps={{ iconName }} text={labelName} styles={commandBarButton} />
          </Fragment>
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
  selected: PropTypes.bool,
  onClick: PropTypes.func,
  index: PropTypes.number,
};
