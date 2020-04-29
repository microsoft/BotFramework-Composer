// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IContextualMenuItem,
  IContextualMenuProps,
} from 'office-ui-fabric-react/lib/components/ContextualMenu/ContextualMenu.types';
import { DialogFactory, ConceptLabels, DialogGroup, dialogGroups, SDKKinds } from '@bfc/shared';

const menuItemHandler = (
  factory: DialogFactory,
  handleType: (
    e: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined,
    item: IContextualMenuItem
  ) => void
) => (
  e: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined,
  item: IContextualMenuItem | undefined
) => {
  if (item) {
    const name =
      ConceptLabels[item.$kind] && ConceptLabels[item.$kind].title ? ConceptLabels[item.$kind].title : item.$kind;
    item = {
      ...item,
      data: {
        ...factory.create(item.$kind, {
          $designer: { name },
        }),
      },
    };
    return handleType(e, item);
  }
};

export const createStepSubmenu = (
  label: string,
  items: IContextualMenuItem[],
  handleType,
  factory
): IContextualMenuItem => {
  const subMenu: IContextualMenuProps = {
    items,
    onItemClick: menuItemHandler(factory, handleType),
  };

  const menuItem: IContextualMenuItem = {
    key: label,
    text: label,
    name: label,
    subMenuProps: subMenu,
  };
  return menuItem;
};

export const createStepMenu = (
  stepLabels: DialogGroup[],
  subMenu = true,
  handleType: (
    e: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined,
    item: IContextualMenuItem
  ) => void,
  factory: DialogFactory,
  filter?: (x: SDKKinds) => boolean
): IContextualMenuItem[] => {
  if (subMenu) {
    const stepMenuItems = stepLabels.map(x => {
      const item = dialogGroups[x];
      if (item.types.length === 1) {
        const conceptLabel = ConceptLabels[item.types[0]];
        return {
          key: item.types[0],
          name: conceptLabel && conceptLabel.title ? conceptLabel.title : item.types[0],
          $kind: item.types[0],
          onClick: menuItemHandler(factory, handleType),
        };
      }
      const subMenu: IContextualMenuProps = {
        items: item.types.filter(filter || (() => true)).map($kind => {
          const conceptLabel = ConceptLabels[$kind];

          return {
            key: $kind,
            name: conceptLabel && conceptLabel.title ? conceptLabel.title : $kind,
            $kind: $kind,
          };
        }),
        onItemClick: menuItemHandler(factory, handleType),
      };

      const menuItem: IContextualMenuItem = {
        key: item.label,
        text: item.label,
        name: item.label,
        subMenuProps: subMenu,
      };
      return menuItem;
    });

    return stepMenuItems;
  } else {
    const stepMenuItems = dialogGroups[stepLabels[0]].types.map(item => {
      const conceptLabel = ConceptLabels[item];
      const name = conceptLabel && conceptLabel.title ? conceptLabel.title : item;
      const menuItem: IContextualMenuItem = {
        key: item,
        text: name,
        name: name,
        $kind: item,
        ...factory.create(item, {
          $designer: { name },
        }),
        data: {
          $kind: item,
          ...factory.create(item, {
            $designer: { name },
          }),
        },
        onClick: (e, item: IContextualMenuItem | undefined) => {
          if (item) {
            return handleType(e, item);
          }
        },
      };
      return menuItem;
    });
    return stepMenuItems;
  }
};
