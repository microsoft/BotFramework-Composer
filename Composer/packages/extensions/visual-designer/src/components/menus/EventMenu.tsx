// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useContext } from 'react';
import { DialogGroup } from '@bfc/shared';

import { NodeRendererContext } from '../../store/NodeRendererContext';

import { createStepMenu } from './createSchemaMenu';
import { IconMenu } from './IconMenu';

interface EventMenuProps {
  label?: string;
  onClick: (item: string | null) => void;
}

export const EventMenu: React.FC<EventMenuProps> = ({ label, onClick, ...rest }): JSX.Element => {
  const { dialogFactory } = useContext(NodeRendererContext);
  const eventMenuItems = createStepMenu(
    [DialogGroup.EVENTS],
    false,
    (e, item): any => onClick(item ? item.data.$kind : null),
    dialogFactory
  );

  return (
    <IconMenu
      iconName="CircleAddition"
      label={label}
      iconStyles={{ color: '#0078D4' }}
      menuItems={eventMenuItems}
      {...rest}
    />
  );
};
