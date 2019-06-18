import React from 'react';
import formatMessage from 'format-message';
import { ConceptLabels } from './labelMap';
import { IconMenu } from './templates/IconMenu';
import { EdgeAddButtonSize } from './elementSizes';
import { dialogGroups, DialogGroup } from './appschema';
export var createStepMenu = function(handleType) {
  console.log('GOT A CALLBACK TO MENU', handleType);
  var stepLabels = [
    DialogGroup.RESPONSE,
    DialogGroup.INPUT,
    DialogGroup.STEP,
    // DialogGroup.BRANCHING,
    DialogGroup.MEMORY,
    DialogGroup.CODE,
    DialogGroup.LOG,
  ];
  var stepMenuItems = stepLabels.map(function(x) {
    var item = dialogGroups[x];
    return {
      key: item.label,
      text: item.label,
      name: item.label,
      subMenuProps: {
        items: item.types.map(function($type) {
          return {
            key: $type,
            name: ConceptLabels[$type] ? ConceptLabels[$type] : $type,
            $type: $type,
            data: {
              $type: $type,
            },
          };
        }),
        onItemClick: function(e, item) {
          console.log('calling handler with ', item);
          return handleType(e, item);
        },
      },
    };
  });
  return stepMenuItems;
};
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
      menuItems: createStepMenu(function(e, item) {
        return onClick(item.$type);
      }),
      label: formatMessage('Add'),
    })
  );
};
//# sourceMappingURL=EdgeMenu.js.map
