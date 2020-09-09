// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import {
  IContextualMenuItem,
  ContextualMenuItemType,
} from 'office-ui-fabric-react/lib/components/ContextualMenu/ContextualMenu.types';
import { SDKKinds, DefinitionSummary } from '@bfc/shared';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';
import { MenuUISchema, MenuOptions } from '@bfc/extension';
import set from 'lodash/set';

import { MenuEventTypes } from '../../constants/MenuTypes';

import { menuOrderMap } from './defaultMenuOrder';

type ActionMenuItemClickHandler = (item?: IContextualMenuItem) => any;
type ActionKindFilter = ($kind: SDKKinds) => boolean;

type MenuTree = { [key: string]: SDKKinds | MenuTree };

const createBaseActionMenu = (
  menuSchema: MenuUISchema,
  onClick: ActionMenuItemClickHandler,
  filter?: ActionKindFilter
): IContextualMenuItem[] => {
  const menuTree: MenuTree = Object.entries(menuSchema).reduce((result, [$kind, options]) => {
    if (filter && !filter($kind as SDKKinds)) return result;

    const optionList: MenuOptions[] = Array.isArray(options) ? options : options ? [options] : [];

    optionList.map((opt) => {
      // use $kind as fallback label
      const label = opt.label || $kind;
      const submenu = opt.submenu;

      if (submenu === false) {
        result[label] = $kind;
      } else if (Array.isArray(submenu)) {
        set(result, [...submenu, label], $kind);
      }
    });
    return result;
  }, {});

  const buildMenuItemFromMenuTree = (labelName: string, labelData: SDKKinds | MenuTree): IContextualMenuItem => {
    if (typeof labelData === 'string') {
      const $kind = labelData;
      return {
        key: $kind,
        name: labelName || $kind,
        onClick: (e, itemData) => onClick(itemData),
      };
    } else {
      const subMenuItems: IContextualMenuItem[] = Object.keys(labelData)
        .sort((label1, label2) => {
          const order1 = menuOrderMap[label1] ?? Number.MAX_VALUE;
          const order2 = menuOrderMap[label2] ?? Number.MAX_VALUE;
          return order1 - order2;
        })
        .map((sublabelName) => buildMenuItemFromMenuTree(sublabelName, labelData[sublabelName]));
      return createSubMenu(labelName, onClick, subMenuItems);
    }
  };

  const stepMenuItems = buildMenuItemFromMenuTree('root', menuTree).subMenuProps?.items || [];
  return stepMenuItems;
};

const createDivider = () => ({
  key: 'divider',
  itemType: ContextualMenuItemType.Divider,
});

const get$kindFrom$ref = ($ref: string): SDKKinds => {
  return $ref.replace('#/definitions/', '') as SDKKinds;
};

const createCustomActionSubMenu = (
  customizedActionGroups: DefinitionSummary[][],
  onClick: ActionMenuItemClickHandler,
  filter?: ($kind: SDKKinds) => boolean
): IContextualMenuItem[] => {
  if (!Array.isArray(customizedActionGroups) || customizedActionGroups.length === 0) {
    return [];
  }

  const itemGroups: IContextualMenuItem[][] = customizedActionGroups
    .filter((actionGroup) => Array.isArray(actionGroup) && actionGroup.length)
    .map((actionGroup) => {
      const items = actionGroup.map(
        ({ title, $ref }) =>
          ({
            key: get$kindFrom$ref($ref),
            name: title,
            onClick: (e, itemData) => onClick(itemData),
          } as IContextualMenuItem)
      );
      if (filter) {
        return items.filter(({ key }) => filter(key as SDKKinds));
      }
      return items;
    });

  const flatMenuItems: IContextualMenuItem[] = itemGroups.reduce((resultItems, currentGroup, currentIndex) => {
    if (currentIndex !== 0) {
      // push a sep line ahead.
      resultItems.push(createDivider());
    }
    resultItems.push(...currentGroup);
    return resultItems;
  }, []);

  return flatMenuItems;
};

const createPasteButtonItem = (
  menuItemCount: number,
  disabled: boolean,
  onClick: ActionMenuItemClickHandler
): IContextualMenuItem => {
  return {
    key: 'Paste',
    name: formatMessage('Paste'),
    ariaLabel: formatMessage('Paste'),
    disabled: disabled,
    onRender: () => {
      return (
        <button
          aria-posinset={1}
          aria-setsize={menuItemCount + 1}
          css={css`
            color: ${disabled ? '#BDBDBD' : '#0078D4'};
            background: #fff;
            width: 100%;
            height: 36px;
            line-height: 36px;
            border-style: none;
            text-align: left;
            padding: 0 8px;
            outline: none;
            &:hover {
              background: rgb(237, 235, 233);
            }
          `}
          disabled={disabled}
          name={formatMessage('Paste')}
          role="menuitem"
          onClick={() => onClick({ key: MenuEventTypes.Paste })}
        >
          <div>
            <FontIcon
              css={css`
                margin-right: 4px;
              `}
              iconName="Paste"
            />
            <span>{formatMessage('Paste')}</span>
          </div>
        </button>
      );
    },
  };
};

interface ActionMenuOptions {
  isSelfHosted: boolean;
  enablePaste: boolean;
}

const createSubMenu = (
  label: string,
  onClick: ActionMenuItemClickHandler,
  subItems: IContextualMenuItem[]
): IContextualMenuItem => {
  return {
    key: label,
    text: label,
    subMenuProps: {
      items: subItems,
      onItemClick: (e, itemData) => onClick(itemData),
    },
  };
};

export const createActionMenu = (
  onClick: ActionMenuItemClickHandler,
  options: ActionMenuOptions,
  menuSchema?: MenuUISchema,
  customActionGroups?: DefinitionSummary[][]
) => {
  const resultItems: IContextualMenuItem[] = [];
  const menuOptions = menuSchema || {};

  // base SDK menu
  const baseMenuItems = createBaseActionMenu(
    menuOptions,
    onClick,
    options.isSelfHosted ? ($kind: SDKKinds) => $kind !== SDKKinds.LogAction : undefined
  );
  resultItems.push(...baseMenuItems);

  // Append a 'Custom Actions' item conditionally.
  if (customActionGroups) {
    // Exclude those $kinds already grouped by uischema
    const is$kindUngrouped = ($kind: SDKKinds) => !menuOptions[$kind];

    const customActionItems = createCustomActionSubMenu(customActionGroups, onClick, is$kindUngrouped);
    if (customActionItems.length) {
      const customActionGroupName = formatMessage('Custom Actions');
      const submenuWithDuplicatedName = resultItems.find((item) => item.text === customActionGroupName);
      if (submenuWithDuplicatedName) {
        // When 'Custom Actions' label exists, append custom actions after that submenu.
        submenuWithDuplicatedName.subMenuProps?.items.push(...customActionItems);
      } else {
        // Otherwise create a new submenu named as 'Custom Actions'.
        resultItems.push(createSubMenu(customActionGroupName, onClick, customActionItems));
      }
    }
  }

  // paste button
  const pasteButtonDisabled = !options.enablePaste;
  const pasteButton = createPasteButtonItem(resultItems.length, pasteButtonDisabled, onClick);
  resultItems.unshift(pasteButton, createDivider());

  return resultItems;
};
