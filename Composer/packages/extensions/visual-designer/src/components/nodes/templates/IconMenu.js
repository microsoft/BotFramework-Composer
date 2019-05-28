import React from 'react';
import { OverflowSet, IconButton, Link } from 'office-ui-fabric-react';

const NodeMenuTemplate = ({ iconName, overflowItems }) => {
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
        menuProps={{ items: overflowItems, calloutProps: { calloutMaxWidth: 100 } }}
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

export const IconMenu = ({ iconName, overflowItems }) => (
  <NodeMenuTemplate iconName={iconName} overflowItems={overflowItems} />
);

IconMenu.defaultProps = {
  onEvent: () => {},
};
