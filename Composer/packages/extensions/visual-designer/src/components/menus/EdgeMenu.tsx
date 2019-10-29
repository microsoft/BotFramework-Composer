/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import React, { useContext } from 'react';
import classnames from 'classnames';
import formatMessage from 'format-message';
import { createStepMenu, DialogGroup, SDKTypes } from 'shared';
import { IContextualMenu } from 'office-ui-fabric-react';

import { EdgeAddButtonSize } from '../../constants/ElementSizes';
import { ClipboardContext } from '../../store/ClipboardContext';
import { SelectionContext } from '../../store/SelectionContext';
import { SelfHostContext } from '../../store/SelfHostContext';
import { AttrNames } from '../../constants/ElementAttributes';
import { MenuTypes } from '../../constants/MenuTypes';

import { IconMenu } from './IconMenu';

interface EdgeMenuProps {
  id: string;
  onClick: (item: string | null) => void;
}

const buildEdgeMenuItemsFromClipboardContext = (
  context,
  onClick,
  filter?: (t: SDKTypes) => boolean
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
    (e, item) => onClick(item ? item.$type : null),
    filter
  );

  const enablePaste = !!clipboardActions.length;
  menuItems.unshift({
    key: 'Paste',
    name: 'Paste',
    disabled: !enablePaste,
    iconProps: {
      iconName: 'Paste',
    },
    style: { color: enablePaste ? '#0078D4' : '#BDBDBD', borderBottom: '1px solid #F3F2F1' },
    onClick: () => onClick('PASTE'),
  });

  return menuItems;
};

export const EdgeMenu: React.FC<EdgeMenuProps> = ({ id, onClick, ...rest }) => {
  const clipboarcContext = useContext(ClipboardContext);
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
        iconSize={10}
        nodeSelected={nodeSelected}
        menuItems={buildEdgeMenuItemsFromClipboardContext(
          clipboarcContext,
          onClick,
          selfHosted ? x => x !== SDKTypes.LogAction : undefined
        )}
        label={formatMessage('Add')}
        {...rest}
      />
    </div>
  );
};
