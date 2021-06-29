// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext } from 'react';
import formatMessage from 'format-message';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { IconMenu } from '@bfc/ui-shared';

import { NodeEventTypes, EditorEventHandler } from '../../adaptive-flow-renderer/constants/NodeEventTypes';
import { MenuTypes } from '../constants/MenuTypes';
import { AttrNames } from '../constants/ElementAttributes';
import { SelectionContext } from '../contexts/SelectionContext';
import { ElementColor } from '../../adaptive-flow-renderer/constants/ElementColors';

const declareElementAttributes = (id: string) => {
  return {
    [AttrNames.SelectableElement]: true,
    [AttrNames.SelectedId]: `${id}${MenuTypes.NodeMenu}`,
  };
};

interface NodeMenuProps {
  id: string;
  onEvent: EditorEventHandler;
  colors: ElementColor;
}
export const NodeMenu: React.FC<NodeMenuProps> = ({ colors = { color: 'black' }, id, onEvent }) => {
  const menuItems = [
    {
      key: 'delete',
      name: formatMessage('Delete'),
      iconProps: {
        iconName: 'Delete',
      },
      onClick: () => onEvent(NodeEventTypes.Delete, { id }),
    },
  ];
  const { selectedIds } = useContext(SelectionContext);
  const nodeSelected = selectedIds.includes(`${id}${MenuTypes.NodeMenu}`);

  const moreLabel = formatMessage('Node menu');

  return (
    <div
      css={{
        marginRight: '1px',
      }}
      {...declareElementAttributes(id)}
    >
      <TooltipHost content={moreLabel}>
        <IconMenu
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={nodeSelected}
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
          label={moreLabel}
          menuItems={menuItems}
          menuWidth={100}
        />
      </TooltipHost>
    </div>
  );
};
