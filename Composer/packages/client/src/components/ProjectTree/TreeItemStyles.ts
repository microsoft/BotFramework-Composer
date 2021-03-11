// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { ICalloutContentStyles } from 'office-ui-fabric-react/lib/Callout';
import { DefaultPalette } from '@uifabric/styling';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuStyles } from 'office-ui-fabric-react/lib/ContextualMenu';

export const projectTreeItemContainer = css`
  outline: none;
  :focus {
    outline: rgb(102, 102, 102) solid 1px;
    z-index: 1;
  }
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  text-align: left;
  cursor: pointer;

  label: ProjectTreeItemContainer;
`;

export const projectTreeItem = css`
  outline: none;
  display: flex;
  align-items: center;
  padding-left: 4px;

  label: ProjectTreeItem;
`;

export const moreMenu: Partial<ICalloutContentStyles> = {
  root: {
    marginTop: '-1px',
  },
};

export const menuStyle: Partial<IContextualMenuStyles> = {
  subComponentStyles: {
    menuItem: {},
    callout: moreMenu,
  },
};

export const moreButton = (isActive: boolean): IButtonStyles => {
  return {
    root: {
      alignSelf: 'stretch',
      visibility: isActive ? 'visible' : 'hidden',
      height: 24,
      width: 24,
      color: NeutralColors.black,
    },
    menuIcon: {
      fontSize: '12px',
      color: NeutralColors.gray160,
    },
    rootHovered: {
      color: DefaultPalette.accent,
      selectors: {
        '.ms-Button-menuIcon': {
          fontWeight: 600,
        },
      },
    },
  };
};

export const navContainer = (
  isAnyMenuOpen: boolean,
  isActive: boolean,
  menuOpenHere: boolean,
  textWidth: number
) => css`
  display: inline-flex;

  ${isAnyMenuOpen
    ? ''
    : `&:hover {
  background: ${isActive ? NeutralColors.gray40 : NeutralColors.gray20};

  .dialog-more-btn {
    visibility: visible;
  }
  .action-btn {
    visibility: visible;
  }
  .treeItem-text {
    max-width: ${textWidth}px;
  }
  }`};
  background: ${isActive ? NeutralColors.gray30 : menuOpenHere ? '#f2f2f2' : 'transparent'};
`;

export const navItem = (isBroken: boolean, padLeft: number, marginLeft: number, isActive: boolean) => css`
  label: navItem;
  font-size: 12px;
  padding-left: ${padLeft}px;
  margin-left: ${marginLeft}px;
  opacity: ${isBroken ? 0.5 : 1};
  display: inline-flex;
  flex-direction: row;
  align-items: center;

  :hover {
    background: ${isActive ? NeutralColors.gray40 : NeutralColors.gray20};
  }
  background: ${isActive ? NeutralColors.gray30 : NeutralColors.white};

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

export const diagnosticLink = css`
  display: flex;
  align-content: start;
  p {
    margin: 2px 5px;
    max-width: 300px;
  }
`;

export const overflowSet = (isBroken: boolean) => css`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  justify-content: space-between;
  display: inline-flex;
  i {
    color: ${isBroken ? SharedColors.red20 : 'inherit'};
  }
`;

export const moreButtonContainer = {
  root: {
    lineHeight: '1',
    display: 'flex' as 'flex',
  },
};

export const statusIcon = {
  fontSize: 15,
  paddingLeft: 8,
};

export const warningIcon = {
  ...statusIcon,
  color: '#BE880A',
};

export const errorIcon = {
  ...statusIcon,
  color: '#CC3F3F',
};

export const diagnosticIcon = {
  width: '20px',
  height: '20px',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center' as 'center',
};

export const diagnosticErrorIcon = {
  ...diagnosticIcon,
  color: '#A80000',
  background: '#FED9CC',
};

export const diagnosticWarningIcon = {
  ...diagnosticIcon,
  color: '#8A8780',
  background: '#FFF4CE',
};
export const itemName = (nameWidth: number) => css`
  max-width: ${nameWidth}px;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
`;

export const calloutRootStyle = css`
  padding: 11px;
`;
