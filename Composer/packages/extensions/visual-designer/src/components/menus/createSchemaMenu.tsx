// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import {
  IContextualMenuItem,
  ContextualMenuItemType,
} from 'office-ui-fabric-react/lib/components/ContextualMenu/ContextualMenu.types';
import { ConceptLabels, DialogGroup, dialogGroups, SDKKinds, DefinitionSummary } from '@bfc/shared';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';

const resolveMenuTitle = ($kind: SDKKinds): string => {
  const conceptLabel = ConceptLabels[$kind];
  return conceptLabel?.title || $kind;
};

type ActionMenuItemClickHandler = (item?: IContextualMenuItem) => any;
type ActionKindFilter = ($kind: SDKKinds) => boolean;

const createBaseActionMenu = (
  onClick: ActionMenuItemClickHandler,
  filter?: ActionKindFilter
): IContextualMenuItem[] => {
  const pickedGroups: DialogGroup[] = [
    DialogGroup.RESPONSE,
    DialogGroup.INPUT,
    DialogGroup.BRANCHING,
    DialogGroup.LOOPING,
    DialogGroup.STEP,
    DialogGroup.MEMORY,
    DialogGroup.CODE,
    DialogGroup.LOG,
  ];
  const stepMenuItems = pickedGroups
    .map(key => dialogGroups[key])
    .filter(groupItem => groupItem && Array.isArray(groupItem.types) && groupItem.types.length)
    .map(({ label, types: actionKinds }) => {
      const subMenuItems: IContextualMenuItem[] = actionKinds
        .filter($kind => (filter ? filter($kind) : true))
        .map($kind => ({
          key: $kind,
          name: resolveMenuTitle($kind),
          onClick: (e, itemData) => onClick(itemData),
        }));

      if (subMenuItems.length === 1) {
        // hoists the only item to upper level
        return subMenuItems[0];
      }
      return createSubMenu(label, onClick, subMenuItems);
    });
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
  onClick: ActionMenuItemClickHandler
): IContextualMenuItem[] => {
  if (!Array.isArray(customizedActionGroups) || customizedActionGroups.length === 0) {
    return [];
  }

  const itemGroups: IContextualMenuItem[][] = customizedActionGroups
    .filter(actionGroup => Array.isArray(actionGroup) && actionGroup.length)
    .map(actionGroup => {
      return actionGroup.map(
        ({ title, $ref }) =>
          ({
            key: get$kindFrom$ref($ref),
            name: title,
            onClick: (e, itemData) => onClick(itemData),
          } as IContextualMenuItem)
      );
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
    name: 'Paste',
    ariaLabel: 'Paste',
    disabled: disabled,
    onRender: () => {
      return (
        <button
          disabled={disabled}
          role="menuitem"
          name="Paste"
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
          onClick={() => onClick({ key: 'Paste' })}
        >
          <div>
            <FontIcon
              iconName="Paste"
              css={css`
                margin-right: 4px;
              `}
            />
            <span>Paste</span>
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
  customActionGroups?: DefinitionSummary[][]
) => {
  const resultItems: IContextualMenuItem[] = [];

  // base SDK menu
  const baseMenuItems = createBaseActionMenu(
    onClick,
    options.isSelfHosted ? ($kind: SDKKinds) => $kind !== SDKKinds.LogAction : undefined
  );
  resultItems.push(...baseMenuItems);

  // Append a 'Custom Actions' item conditionally.
  if (customActionGroups) {
    const customActionItems = createCustomActionSubMenu(customActionGroups, onClick);
    if (customActionItems.length) {
      const customActionTitle = formatMessage('Custom Actions');
      resultItems.push(createSubMenu(customActionTitle, onClick, customActionItems));
    }
  }

  // paste button
  const pasteButtonDisabled = !options.enablePaste;
  const pasteButton = createPasteButtonItem(resultItems.length, pasteButtonDisabled, onClick);
  resultItems.unshift(pasteButton, createDivider());

  return resultItems;
};
