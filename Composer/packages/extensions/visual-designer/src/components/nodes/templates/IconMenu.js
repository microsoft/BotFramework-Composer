import React from 'react';
import PropTypes from 'prop-types';
import { OverflowSet, IconButton, Link } from 'office-ui-fabric-react';

const NodeMenuTemplate = ({ iconName, overflowItems, menuWidth }) => {
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
      overflowItems={overflowItems}
      onRenderOverflowButton={_onRenderOverflowButton}
      onRenderItem={_onRenderItem}
    />
  );
};

export const IconMenu = ({ iconName, overflowItems, menuWidth }) => (
  <NodeMenuTemplate iconName={iconName} overflowItems={overflowItems} menuWidth={menuWidth} />
);

IconMenu.defaultProps = {
  iconName: 'More',
  overflowItems: [],
  menuWidth: 100,
};

IconMenu.propTypes = {
  iconName: PropTypes.string.isRequired,
  overflowItems: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      onClick: PropTypes.func,
    })
  ).isRequired,
  menuWidth: PropTypes.number,
};
