/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext } from 'react';
import classnames from 'classnames';

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
export const NodeMenu = ({ id, onEvent }): JSX.Element => {
  const menuItems = [
    {
      key: 'delete',
      name: 'Delete',
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
        iconStyles={{
          color: '#0078D4',
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
      />
    </div>
  );
};
