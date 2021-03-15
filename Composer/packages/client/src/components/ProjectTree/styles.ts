// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { ICalloutContentStyles } from 'office-ui-fabric-react/lib/Callout';
import { DefaultPalette } from '@uifabric/styling';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuStyles } from 'office-ui-fabric-react/lib/ContextualMenu';

import { INDENT_PER_LEVEL } from './constants';

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
      height: 20,
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

export const treeItem = (
  isAnyMenuOpen: boolean,
  isActive: boolean,
  menuOpenHere: boolean,
  isBroken: boolean,
  padLeft: number,
  marginLeft: number
) => css`
  label: treeItem_container;

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
  }`};
  background: ${isActive ? NeutralColors.gray40 : menuOpenHere ? '#f2f2f2' : 'transparent'};

  font-size: 12px;
  opacity: ${isBroken ? 0.5 : 1};
  display: inline-flex;
  flex-direction: row;
  padding-left: ${padLeft}px;
  margin-left: ${marginLeft}px;
  align-items: center;

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
  label: overflow-set;
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
`;

export const calloutRootStyle = css`
  padding: 11px;
`;

export const summaryStyle = (depth: number, isActive: boolean, isOpen: boolean) => css`
  label: summary;
  padding-left: ${depth * INDENT_PER_LEVEL + 12}px;
  :hover {
    background: ${isActive ? NeutralColors.gray40 : NeutralColors.gray20};
  }
  background: ${isActive ? NeutralColors.gray40 : NeutralColors.white};
  ${isOpen ? 'list-style-type: "⏷";' : 'list-style-type: "⏵";'}
`;

export const root = css`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  .ms-List-cell {
    min-height: 36px;
  }
`;

export const focusStyle = css`
  height: 100%;
  position: relative;
`;

export const icons = {
  TRIGGER: 'LightningBolt',
  DIALOG: 'Org',
  FORM_DIALOG: 'Table',
  FORM_FIELD: 'Variable2', // x in parentheses
  FORM_TRIGGER: 'TriggerAuto', // lightning bolt with gear
  FILTER: 'Filter',
  LG: 'Robot',
  LU: 'People',
};

export const tree = css`
  height: calc(100% - 45px);
  overflow-y: auto;
  label: tree;
`;

export const headerCSS = (label: string, isActive?: boolean) => css`
  width: 100%;
  label: ${label};
  :hover {
    background: ${isActive ? NeutralColors.gray40 : NeutralColors.gray20};
  }
  background: ${isActive ? NeutralColors.gray30 : NeutralColors.white};
`;
