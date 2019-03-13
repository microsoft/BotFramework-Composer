import React from 'react';
import { Link } from '@reach/router';
import { PropTypes } from 'prop-types';

export const NavLink = props => {
  return (
    <Link
      {...props}
      getProps={({ isCurrent }) => {
        return isCurrent ? { style: props.activestyle } : null;
      }}
    />
  );
};

NavLink.propTypes = {
  activestyle: PropTypes.object,
};
