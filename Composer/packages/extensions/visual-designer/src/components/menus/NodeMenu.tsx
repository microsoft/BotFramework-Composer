// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext } from 'react';
import classnames from 'classnames';
import formatMessage from 'format-message';

import { NodeEventTypes } from '../../constants/NodeEventTypes';
import { MenuTypes } from '../../constants/MenuTypes';
import { AttrNames } from '../../constants/ElementAttributes';
import { SelectionContext } from '../../store/SelectionContext';

import { IconMenu } from './IconMenu';

const declareElementAttributes = (id: string) => {
  return {
    [AttrNames.SelectableElement]: true,
    [AttrNames.SelectedId]: `${id}${MenuTypes.NodeMenu}`,
  };
};
export const NodeMenu = ({ colors, id, onEvent }) => {
  const menuItems = [
    {
      key: 'delete',
      name: 'Delete',
      iconProps: {
        iconName: 'Delete',
      },
      onClick: () => onEvent(NodeEventTypes.Delete, { id }),
    },
  ];
  const { selectedIds } = useContext(SelectionContext);
  const nodeSelected = selectedIds.includes(`${id}${MenuTypes.NodeMenu}`);

  return (
    <div
      css={{
        marginRight: '1px',
      }}
      className={classnames({ 'step-renderer-container--selected': nodeSelected })}
      {...declareElementAttributes(id)}
    >
      <IconMenu
        iconName="MoreVertical"
        iconSize={12}
        iconStyles={{
          color: `${colors.color}`,
          selectors: {
            ':focus': {
              outline: 'none',
              selectors: {
                '::after': {
                  outline: '1px solid #0078d4 !important',
                },
              },
            },
          },
        }}
        menuItems={menuItems}
        menuWidth={100}
        nodeSelected={nodeSelected}
        label={formatMessage('node menu')}
      />
    </div>
  );
};
