import React from 'react';
import formatMessage from 'format-message';
import { IconMenu } from './templates/IconMenu';
import { EdgeAddButtonSize } from './elementSizes';
import { createStepMenu, DialogGroup } from './appschema';
export var EdgeMenu = function(_a) {
  var onClick = _a.onClick;
  return React.createElement(
    'div',
    {
      style: {
        width: EdgeAddButtonSize.width,
        height: EdgeAddButtonSize.height,
        borderRadius: '8px',
        backdropFilter: 'white',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        background: 'white',
      },
    },
    React.createElement(IconMenu, {
      iconName: 'Add',
      iconStyles: { background: 'white', color: '#005CE6' },
      iconSize: 10,
      menuItems: createStepMenu(
        [DialogGroup.RESPONSE, DialogGroup.INPUT, DialogGroup.STEP, DialogGroup.CODE, DialogGroup.LOG],
        true,
        function(e, item) {
          return onClick(item.$type);
        }
      ),
      label: formatMessage('Add'),
    })
  );
};
//# sourceMappingURL=EdgeMenu.js.map
