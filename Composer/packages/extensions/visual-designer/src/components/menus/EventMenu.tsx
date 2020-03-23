// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { createStepMenu, DialogGroup } from '@bfc/shared';

import { IconMenu } from './IconMenu';

interface EventMenuProps {
  label?: string;
  onClick: (item: string | null) => void;
}

export const EventMenu: React.FC<EventMenuProps> = ({ label, onClick, ...rest }): JSX.Element => {
  const eventMenuItems = createStepMenu([DialogGroup.EVENTS], false, (e, item): any =>
    onClick(item ? item.$kind : null)
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
