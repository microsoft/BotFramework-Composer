import React from 'react';
import formatMessage from 'format-message';

import { IconMenu } from '../nodes/templates/IconMenu';
import { EdgeAddButtonSize } from '../../shared/elementSizes';
import { dialogGroups, DialogGroup, DialogGroupLabels } from '../../shared/appschema';

const createStepMenu = handleType => {
  const stepLabels = [
    DialogGroup.RESPONSE,
    DialogGroup.INPUT,
    DialogGroup.STEP,
    // DialogGroup.BRANCHING,
    DialogGroup.MEMORY,
    DialogGroup.CODE,
    DialogGroup.LOG,
  ];

  const stepMenuItems = stepLabels.map(x => {
    const item = dialogGroups[x];
    return {
      key: item.label,
      name: item.label,
      subMenuProps: {
        items: item.types.map($type => ({
          key: $type,
          name: DialogGroupLabels[$type] ? formatMessage(DialogGroupLabels[$type]) : $type,
          $type: $type,
        })),
        onItemClick: (e, item) => handleType(item.$type),
      },
    };
  });

  return stepMenuItems;
};

export const EdgeMenu = ({ onClick }) => {
  return (
    <div
      style={{
        width: EdgeAddButtonSize.width,
        height: EdgeAddButtonSize.height,
        borderRadius: '8px',
        backdropFilter: 'white',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        background: 'white',
      }}
    >
      <IconMenu
        iconName="Add"
        iconStyles={{ background: 'white', color: '#005CE6', transform: 'scale(0.625)' }}
        menuItems={createStepMenu($type => onClick($type))}
      />
    </div>
  );
};
