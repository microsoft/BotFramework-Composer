// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { FontWeights } from '@uifabric/styling';
import { OverflowSet, IOverflowSetItemProps } from 'office-ui-fabric-react/lib/OverflowSet';
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';
import { ContextualMenuItemType, IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';
import { NeutralColors } from '@uifabric/fluent-theme';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuStyles } from 'office-ui-fabric-react/lib/ContextualMenu';
import { ICalloutContentStyles } from 'office-ui-fabric-react/lib/Callout';

import { TreeLink, TreeMenuItem } from './ProjectTree';

// -------------------- Styles -------------------- //
const indent = 8;
const itemText = css`
  outline: none;
  :focus {
    outline: rgb(102, 102, 102) solid 1px;
    z-index: 1;
  }
  padding-left: ${indent}px;
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
  justify-items: center;
  height: 24px;

  label: ProjectTreeItem;
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

const navItem = (isActive: boolean, shift: number) => css`
  width: 100%;
  position: relative;
  height: 24px;
  font-size: 12px;
  margin-left: ${shift}px;
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

export const overflowSet = css`
  width: 100%;
  height: 100%;
  padding-right: 12px;
  box-sizing: border-box;
  line-height: 20px;
  justify-content: space-between;
  display: flex;
`;

const statusIcon = {
  width: '24px',
  fontSize: 16,
  marginLeft: 6,
};

const warningIcon = {
  ...statusIcon,
  color: '#BE880A',
};

const errorIcon = {
  ...statusIcon,
  color: '#CC3F3F',
};

// -------------------- TreeItem -------------------- //

interface ITreeItemProps {
  link: TreeLink;
  isActive?: boolean;
  isSubItemActive?: boolean;
  menu: TreeMenuItem[];
  onSelect?: (link: TreeLink) => void;
  icon?: string;
  dialogName?: string;
  showProps?: boolean;
  shiftOut?: number; // needed to make an outline look right; should be the size of the "details" reveal arrow
}

const renderTreeMenuItem = (item: TreeMenuItem) => {
  if (item.label === '') {
    return {
      key: 'divider',
      itemType: ContextualMenuItemType.Divider,
    };
  }
  return {
    key: item.label,
    ariaLabel: item.label,
    text: item.label,
    iconProps: { iconName: item.icon },
    onItemClick: item.action,
  };
};

const onRenderItem = (item: IOverflowSetItemProps) => {
  const warningContent = formatMessage(
    'This trigger type is not supported by the RegEx recognizer and will not be fired.'
  );
  const errorContent = 'stub for error content'; // TODO: get actual warning and error messages from link
  return (
    <div
      data-is-focusable
      aria-label={warningContent}
      css={itemText}
      role="cell"
      tabIndex={0}
      onBlur={item.onBlur}
      onFocus={item.onFocus}
    >
      <div css={content} role="presentation" tabIndex={-1}>
        {item.icon != null && (
          <Icon
            iconName={item.icon}
            styles={{
              root: {
                width: '12px',
                marginRight: '8px',
                outline: 'none',
              },
            }}
            tabIndex={-1}
          />
        )}
        {item.displayName}
        {item.errorContent && (
          <TooltipHost content={errorContent} directionalHint={DirectionalHint.bottomLeftEdge}>
            <Icon iconName={'Warning'} style={warningIcon} />
          </TooltipHost>
        )}
        {item.warningContent && (
          <TooltipHost content={warningContent} directionalHint={DirectionalHint.bottomLeftEdge}>
            <Icon iconName={'ErrorBadge'} style={errorIcon} />
          </TooltipHost>
        )}
      </div>
    </div>
  );
};

const onRenderOverflowButton = (isActive: boolean) => {
  const moreLabel = formatMessage('Actions');
  return (overflowItems: IContextualMenuItem[]) => {
    return (
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
    );
  };
};

export const TreeItem: React.FC<ITreeItemProps> = ({ link, isActive, icon, dialogName, shiftOut, onSelect, menu }) => {
  const a11yLabel = `${dialogName ?? '$Root'}_${link.displayName}`;

  const overflowMenu = menu.map(renderTreeMenuItem);

  const linkString = `${link.projectId}_DialogTreeItem${link.dialogName}_${link.trigger ?? ''}`;

  return (
    <div
      aria-label={a11yLabel}
      css={navItem(!!isActive, shiftOut ?? 0)}
      data-testid={a11yLabel}
      role="gridcell"
      tabIndex={0}
      onClick={() => {
        onSelect?.(link);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSelect?.(link);
        }
      }}
    >
      <OverflowSet
        //In 8.0 the OverflowSet will no longer be wrapped in a FocusZone
        //remove this at that time
        doNotContainWithinFocusZone
        css={overflowSet}
        data-testid={linkString}
        items={[
          {
            key: linkString,
            icon,
            ...link,
          },
        ]}
        overflowItems={overflowMenu}
        role="row"
        styles={{ item: { flex: 1 } }}
        onRenderItem={onRenderItem}
        onRenderOverflowButton={onRenderOverflowButton(!!isActive)}
      />
    </div>
  );
};
