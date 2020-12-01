// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ContextualMenuItemType, IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';

type ExpressionGroupingType = {
  key: string;
  name: string;
  children: string[];
};

export const expressionGroupingsToMenuItems = (
  expressionGroupings: ExpressionGroupingType[],
  menuItemSelectedHandler: (key: string) => void,
  onLayerMounted: () => void,
  maxHeight?: number
): IContextualMenuItem[] => {
  const menuItems: IContextualMenuItem[] =
    expressionGroupings?.map((grouping: ExpressionGroupingType) => {
      return {
        key: grouping.key,
        text: grouping.name,
        target: '_blank',
        subMenuProps: {
          calloutProps: { onLayerMounted: onLayerMounted },
          items: grouping.children.map((key: string) => {
            return {
              key: key,
              text: key,
              onClick: () => menuItemSelectedHandler(key),
            };
          }),
          styles: { container: { maxHeight } },
        },
      };
    }) || [];

  const header = {
    key: 'header',
    itemType: ContextualMenuItemType.Header,
    text: 'Pre-built functions',
    itemProps: { lang: 'en-us' },
  };

  menuItems.unshift(header);

  return menuItems;
};
