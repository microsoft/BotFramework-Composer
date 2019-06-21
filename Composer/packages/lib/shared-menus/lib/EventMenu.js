import React from 'react';
import { IconMenu } from './templates/IconMenu';
import { createStepMenu, DialogGroup } from './appschema';
export var EventMenu = function(_a) {
  var onClick = _a.onClick;
  return React.createElement(IconMenu, {
    iconName: 'CircleAddition',
    label: '',
    iconStyles: { color: '#0078D4' },
    menuItems: createStepMenu([DialogGroup.EVENTS], false, function(e, item) {
      return onClick(item ? item.$type : null);
    }),
  });
};
//# sourceMappingURL=EventMenu.js.map
