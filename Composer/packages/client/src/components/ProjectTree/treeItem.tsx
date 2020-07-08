// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { OverflowSet, IOverflowSetItemProps } from 'office-ui-fabric-react/lib/OverflowSet';
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';

import { moreButton, overflowSet, menuStyle, navItem, itemText, content, warningIcon, warningText } from './styles';

interface ITreeItemProps {
  link: any;
  isActive: boolean;
  isSubItemActive?: boolean;
  depth: number | undefined;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

const onRenderItem = (item: IOverflowSetItemProps) => {
  return (
    <div
      data-is-focusable
      css={itemText(item.depth)}
      role="cell"
      tabIndex={0}
      onBlur={item.onBlur}
      onFocus={item.onFocus}
    >
      <div css={content} tabIndex={-1}>
        {item.depth !== 0 && (
          <Icon
            iconName="Flow"
            styles={{
              root: {
                marginRight: '8px',
                outline: 'none',
              },
            }}
            tabIndex={-1}
          />
        )}
        {item.displayName}
        {item.warning && <Icon iconName={'Warning'} style={warningIcon} />}
        {item.warning && <div css={warningText}>{'Not supported with Regex'} </div>}
      </div>
    </div>
  );
};

const onRenderOverflowButton = (isRoot: boolean, isActive: boolean) => {
  const moreLabel = formatMessage('Actions');
  const showIcon = !isRoot;
  return (overflowItems) => {
    return showIcon ? (
      <TooltipHost content={moreLabel} directionalHint={DirectionalHint.rightCenter}>
        <IconButton
          ariaLabel={moreLabel}
          className="dialog-more-btn"
          data-is-focusable={isActive}
          data-testid="dialogMoreButton"
          menuIconProps={{ iconName: 'MoreVertical' }}
          menuProps={{ items: overflowItems, styles: menuStyle }}
          role="cell"
          styles={moreButton(isActive)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.stopPropagation();
            }
          }}
        />
      </TooltipHost>
    ) : null;
  };
};

export const TreeItem: React.FC<ITreeItemProps> = (props) => {
  const { link, isActive, isSubItemActive, depth, onDelete, onSelect } = props;
  return (
    <div
      css={navItem(isActive, !!isSubItemActive)}
      role="presentation"
      onClick={() => {
        onSelect(link.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSelect(link.id);
        }
      }}
    >
      <OverflowSet
        //In 8.0 the OverflowSet will no longer be wrapped in a FocusZone
        //remove this at that time
        doNotContainWithinFocusZone
        css={overflowSet}
        data-testid={`DialogTreeItem${link.id}`}
        items={[
          {
            key: link.id,
            depth,
            ...link,
          },
        ]}
        overflowItems={[
          {
            key: 'delete',
            name: 'Delete',
            onClick: () => onDelete(link.id),
          },
        ]}
        role="row"
        styles={{ item: { flex: 1 } }}
        onRenderItem={onRenderItem}
        onRenderOverflowButton={onRenderOverflowButton(link.isRoot, isActive)}
      />
    </div>
  );
};
