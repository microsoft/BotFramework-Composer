import React from 'react';
import { Link } from '@reach/router';
import { PropTypes } from 'prop-types';

export const NavLink = props => {
  const { style, activestyle, to, exact, children } = props;

  return (
    <Link
      to={to}
      style={style}
      getProps={({ isCurrent, isPartiallyCurrent }) => {
        const activeStyle = { style: { ...style, ...activestyle } };
        const isActive = exact ? isCurrent : isPartiallyCurrent;
        return isActive ? activeStyle : null;
      }}
    >
      {children}
    </Link>
  );
};

NavLink.propTypes = {
  children: PropTypes.element,
  to: PropTypes.string,
  style: PropTypes.object,
  activestyle: PropTypes.object,
  exact: PropTypes.bool,
};
