// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { FontWeights } from '@uifabric/styling';
import { OverflowSet, IOverflowSetItemProps } from 'office-ui-fabric-react/lib/OverflowSet';
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';
import { NeutralColors } from '@uifabric/fluent-theme';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuStyles } from 'office-ui-fabric-react/lib/ContextualMenu';
import { ICalloutContentStyles } from 'office-ui-fabric-react/lib/Callout';

// -------------------- Styles -------------------- //
const indent = 16;
const itemText = (depth: number) => css`
  outline: none;
  :focus {
    outline: rgb(102, 102, 102) solid 1px;
    z-index: 1;
  }
  padding-left: ${depth * indent}px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  text-align: left;
  cursor: pointer;
  width: 100%;

  label: ProjectTreeItemContainer;
`;

const content = css`
  outline: none;
  display: flex;
  align-items: center;
  justify-items: middle;
  height: 24px;

  label: ProjectTreeItem;
`;

const leftIndent = css`
  height: 100%;
  width: ${indent}px;
`;

const moreMenu: Partial<ICalloutContentStyles> = {
  root: {
    marginTop: '-7px',
    width: '100px',
  },
};

const menuStyle: Partial<IContextualMenuStyles> = {
  subComponentStyles: {
    menuItem: {},
    callout: moreMenu,
  },
};

const moreButton = (isActive: boolean): IButtonStyles => {
  return {
    root: {
      padding: '0 4px',
      alignSelf: 'stretch',
      visibility: isActive ? 'visible' : 'hidden',
      height: 'auto',
      width: '16px',
    },
    menuIcon: {
      fontSize: '14px',
      color: '#000',
    },
  };
};

const navItem = (isActive: boolean) => css`
  width: 100%;
  position: relative;
  height: 24px;
  font-size: 12px;
  color: ${isActive ? '#ffffff' : '#545454'};
  background: ${isActive ? '#0078d4' : 'transparent'};
  font-weight: ${isActive ? FontWeights.semibold : FontWeights.regular};
  &:hover {
    color: #545454;
    background: #f2f2f2;

    .dialog-more-btn {
      visibility: visible;
    }
  }
  &:focus {
    outline: none;
    .ms-Fabric--isFocusVisible &::after {
      top: 0px;
      right: 1px;
      bottom: 0px;
      left: 1px;
      content: '';
      position: absolute;
      z-index: 1;
      border: 1px solid ${NeutralColors.white};
      border-image: initial;
      outline: rgb(102, 102, 102) solid 1px;
    }
  }
`;

export const overflowSet = (depth: number) => css`
  width: 100%;
  height: 100%;
  padding-left: ${depth * 12}px;
  padding-right: 12px;
  box-sizing: border-box;
  line-height: 24px;
  justify-content: space-between;
  display: flex;
  justify-content: space-between;
`;

const warningIcon = {
  marginRight: 5,
  color: '#BE880A',
  fontSize: 9,
};

// -------------------- TreeItem -------------------- //

interface ITreeItemProps {
  link: any;
  isActive?: boolean;
  isSubItemActive?: boolean;
  depth: number | undefined;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  icon?: string;
  dialogName?: string;
}

const onRenderItem = (item: IOverflowSetItemProps) => {
  const warningContent = formatMessage(
    'This trigger type is not supported by the RegEx recognizer and will not be fired.'
  );
  return (
    <div
      data-is-focusable
      aria-label={warningContent}
      css={itemText(item.depth)}
      role="cell"
      tabIndex={0}
      onBlur={item.onBlur}
      onFocus={item.onFocus}
    >
      <div css={content} role="presentation" tabIndex={-1}>
        {item.warningContent ? (
          <TooltipHost content={warningContent} directionalHint={DirectionalHint.bottomLeftEdge}>
            <Icon iconName={'Warning'} style={warningIcon} />
          </TooltipHost>
        ) : (
          <div css={leftIndent} />
        )}
        {item.icon != null && (
          <Icon
            iconName={item.icon}
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
  const { link, isActive, depth, onDelete, onSelect, icon, dialogName } = props;

  const a11yLabel = `${dialogName ?? '$Root'}_${link.displayName}`;

  return (
    <div
      aria-label={a11yLabel}
      css={navItem(!!isActive)}
      data-testid={a11yLabel}
      role="gridcell"
      tabIndex={0}
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
        css={overflowSet(depth ?? 0)}
        data-testid={`DialogTreeItem${link.id}`}
        items={[
          {
            key: link.id,
            depth,
            icon,
            ...link,
          },
        ]}
        overflowItems={[
          {
            key: 'delete',
            name: formatMessage('Delete'),
            onClick: () => onDelete(link.id),
          },
          {
            key: 'props',
            name: formatMessage('Properties'),
            onClick: () => onSelect(link.id),
          },
        ]}
        role="row"
        styles={{ item: { flex: 1 } }}
        onRenderItem={onRenderItem}
        onRenderOverflowButton={onRenderOverflowButton(link.isRoot, !!isActive)}
      />
    </div>
  );
};
