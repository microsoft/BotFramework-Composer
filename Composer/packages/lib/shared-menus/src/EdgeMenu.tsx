import React from 'react';
import formatMessage from 'format-message';
import { ConceptLabels } from './labelMap';
import { IconMenu } from './templates/IconMenu';
import { EdgeAddButtonSize } from './elementSizes';
import { dialogGroups, DialogGroup } from './appschema';
import { IContextualMenuItem, IContextualMenuProps } from 'office-ui-fabric-react';

export const createStepMenu = (handleType: (e: any, item: IContextualMenuItem) => void): IContextualMenuItem[] => {
  console.log('GOT A CALLBACK TO MENU', handleType);

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
      text: item.label,
      name: item.label,
      subMenuProps: {
        items: item.types.map($type => ({
          key: $type,
          name: ConceptLabels[$type] ? ConceptLabels[$type] : $type,
          $type: $type,
          data: {
            $type: $type, // used by the steps field to create the item
          },
        })),
        onItemClick: (e, item: IContextualMenuItem) => {
          console.log('calling handler with ', item);
          return handleType(e, item);
        },
      } as IContextualMenuProps,
    } as IContextualMenuItem;
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
        iconStyles={{ background: 'white', color: '#005CE6' }}
        iconSize={10}
        menuItems={createStepMenu((e, item) => onClick(item.$type))}
        label={formatMessage('Add')}
      />
    </div>
  );
};
