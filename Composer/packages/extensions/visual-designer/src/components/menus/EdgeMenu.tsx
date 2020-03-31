// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useContext } from 'react';
import classnames from 'classnames';
import formatMessage from 'format-message';
import { createStepMenu, createStepSubmenu, DialogGroup, SDKTypes } from '@bfc/shared';
import {
  IContextualMenu,
  ContextualMenuItemType,
  IContextualMenuItem,
} from 'office-ui-fabric-react/lib/ContextualMenu';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import get from 'lodash/get';

import { EdgeAddButtonSize } from '../../constants/ElementSizes';
import { NodeRendererContext, NodeRendererContextValue } from '../../store/NodeRendererContext';
import { SelectionContext } from '../../store/SelectionContext';
import { SelfHostContext } from '../../store/SelfHostContext';
import { AttrNames } from '../../constants/ElementAttributes';
import { MenuTypes } from '../../constants/MenuTypes';

import { IconMenu } from './IconMenu';

interface EdgeMenuProps {
  id: string;
  onClick: (item: string | null) => void;
}

const buildSubMenuFromSchemas = (schemas: any, handleType, factory): IContextualMenuItem[] => {
  const { sdk, diagnostics, visual, ...otherSchemas } = schemas;

  return Object.keys(otherSchemas).map(x => {
    const subitems: IContextualMenuItem[] = get(otherSchemas[x], 'content.oneOf', []).map(
      ({ title: $type, label }) => ({
        key: $type,
        name: label || $type,
        $type,
      })
    );
    return createStepSubmenu(x, subitems, handleType, factory);
  });
};

const buildEdgeMenuItemsFromClipboardContext = (
  context: NodeRendererContextValue,
  onClick,
  filter?: (t: SDKTypes) => boolean
): IContextualMenu[] => {
  const { clipboardActions, schemas } = context;
  const menuItems = createStepMenu(
    [
      DialogGroup.RESPONSE,
      DialogGroup.INPUT,
      DialogGroup.BRANCHING,
      DialogGroup.STEP,
      DialogGroup.MEMORY,
      DialogGroup.CODE,
      DialogGroup.LOG,
    ],
    true,
    (e, item) => onClick(item ? item.data.$type : null),
    context.dialogFactory,
    filter
  );

  menuItems.push(
    ...buildSubMenuFromSchemas(schemas, (e, item) => onClick(item ? item.data.$type : null), context.dialogFactory)
  );

  const enablePaste = Array.isArray(clipboardActions) && clipboardActions.length > 0;
  const menuItemCount = menuItems.length;
  menuItems.unshift(
    {
      key: 'Paste',
      name: 'Paste',
      ariaLabel: 'Paste',
      disabled: !enablePaste,
      onRender: () => {
        return (
          <button
            disabled={!enablePaste}
            role="menuitem"
            name="Paste"
            aria-posinset={1}
            aria-setsize={menuItemCount + 1}
            css={css`
              color: ${enablePaste ? '#0078D4' : '#BDBDBD'};
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
            onClick={() => onClick('PASTE')}
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
    },
    {
      key: 'divider',
      itemType: ContextualMenuItemType.Divider,
    }
  );

  return menuItems;
};

export const EdgeMenu: React.FC<EdgeMenuProps> = ({ id, onClick, ...rest }) => {
  const nodeContext = useContext(NodeRendererContext);
  const selfHosted = useContext(SelfHostContext);
  const { selectedIds } = useContext(SelectionContext);
  const nodeSelected = selectedIds.includes(`${id}${MenuTypes.EdgeMenu}`);
  const declareElementAttributes = (id: string) => {
    return {
      [AttrNames.SelectableElement]: true,
      [AttrNames.EdgeMenuElement]: true,
      [AttrNames.SelectedId]: `${id}${MenuTypes.EdgeMenu}`,
    };
  };

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
        outline: nodeSelected ? '1px solid #0078d4' : '',
      }}
      className={classnames({ 'step-renderer-container--selected': nodeSelected })}
      {...declareElementAttributes(id)}
    >
      <IconMenu
        iconName="Add"
        iconStyles={{
          background: 'white',
          color: '#005CE6',
          selectors: {
            ':focus': {
              outline: 'none',
              selectors: {
                '::after': {
                  outline: 'none !important',
                },
              },
            },
          },
        }}
        iconSize={7}
        nodeSelected={nodeSelected}
        menuItems={buildEdgeMenuItemsFromClipboardContext(
          nodeContext,
          onClick,
          selfHosted ? x => x !== SDKTypes.LogAction : undefined
        )}
        label={formatMessage('Add')}
        {...rest}
      />
    </div>
  );
};
