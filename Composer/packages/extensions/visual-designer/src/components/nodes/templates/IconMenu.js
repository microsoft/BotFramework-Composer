import React from 'react';
import PropTypes from 'prop-types';
import { OverflowSet, IconButton, Link } from 'office-ui-fabric-react';

export const IconMenu = ({ iconName, iconStyles, menuItems, menuWidth }) => {
  const _onRenderItem = item => {
    return (
      <Link styles={{ root: { marginRight: 10 } }} onClick={item.onClick}>
        {item.name}
      </Link>
    );
  };

  const _onRenderOverflowButton = overflowItems => {
    const buttonStyles = {
      root: {
        minWidth: 0,
        padding: '0 4px',
        alignSelf: 'stretch',
        height: 'auto',
        color: 'white',
        ...iconStyles,
      },
    };
    return (
      <IconButton
        styles={buttonStyles}
        menuIconProps={{ iconName }}
        menuProps={{ items: overflowItems, calloutProps: { calloutMaxWidth: menuWidth } }}
      />
    );
  };

  return (
    <OverflowSet
      styles={{ position: 'absolute', top: 0 }}
      vertical
      overflowItems={menuItems}
      onRenderOverflowButton={_onRenderOverflowButton}
      onRenderItem={_onRenderItem}
    />
  );
};

IconMenu.defaultProps = {
  iconName: 'More',
  iconStyles: {},
  menuItems: [],
  menuWidth: 0,
};

IconMenu.propTypes = {
  iconName: PropTypes.string.isRequired,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      onClick: PropTypes.func,
    })
  ).isRequired,
  menuWidth: PropTypes.number,
};
