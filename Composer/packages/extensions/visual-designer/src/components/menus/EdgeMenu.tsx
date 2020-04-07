// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useCallback, useContext } from 'react';
import classnames from 'classnames';
import formatMessage from 'format-message';
import { createStepMenu, DialogGroup, SDKKinds } from '@bfc/shared';
import { IContextualMenu, ContextualMenuItemType } from 'office-ui-fabric-react/lib/ContextualMenu';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';

import { EdgeAddButtonSize } from '../../constants/ElementSizes';
import { NodeRendererContext } from '../../store/NodeRendererContext';
import { SelectionContext } from '../../store/SelectionContext';
import { SelfHostContext } from '../../store/SelfHostContext';
import { AttrNames } from '../../constants/ElementAttributes';
import { MenuTypes } from '../../constants/MenuTypes';

import { IconMenu } from './IconMenu';

interface EdgeMenuProps {
  id: string;
  onClick: (item: string | null) => void;
  addCoachMarkRef?: (ref: { [key: string]: HTMLDivElement }) => void;
}

const buildEdgeMenuItemsFromClipboardContext = (
  context,
  onClick,
  filter?: (t: SDKKinds) => boolean
): IContextualMenu[] => {
  const { clipboardActions } = context;
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
    (e, item) => onClick(item ? item.data.$kind : null),
    context.dialogFactory,
    filter
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

export const EdgeMenu: React.FC<EdgeMenuProps> = ({ id, addCoachMarkRef, onClick, ...rest }) => {
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

  const addRef = useCallback((action: HTMLDivElement) => addCoachMarkRef && addCoachMarkRef({ action }), []);

  return (
    <div
      ref={addRef}
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
          selfHosted ? x => x !== SDKKinds.LogAction : undefined
        )}
        label={formatMessage('Add')}
        {...rest}
      />
    </div>
  );
};
