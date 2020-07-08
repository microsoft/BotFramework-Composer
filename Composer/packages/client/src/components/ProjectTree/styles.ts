// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontWeights } from '@uifabric/styling';
import { NeutralColors, FontSizes, SharedColors } from '@uifabric/fluent-theme';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuStyles } from 'office-ui-fabric-react/lib/ContextualMenu';
import { ICalloutContentStyles } from 'office-ui-fabric-react/lib/Callout';
import { IGroupedListStyles } from 'office-ui-fabric-react/lib/GroupedList';
import { ISearchBoxStyles } from 'office-ui-fabric-react/lib/SearchBox';

export const groupListStyle: Partial<IGroupedListStyles> = {
  root: {
    width: '100%',
    boxSizing: 'border-box',
  },
};

export const searchBox: ISearchBoxStyles = {
  root: {
    borderBottom: '1px solid #edebe9',
    height: '45px',
    borderRadius: '0px',
  },
};
export const root = css`
  width: 100%;
  height: 100%;
  border-right: 1px solid #c4c4c4;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  .ms-List-cell {
    min-height: 36px;
  }
`;

export const navItem = (isActive: boolean, isSubItemActive: boolean) => css`
  width: 100%;
  position: relative;
  height: 36px;
  font-size: 12px;
  color: #545454;
  background: ${isActive && !isSubItemActive ? '#f2f2f2' : 'transparent'};
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

export const itemText = (depth: number) => css`
  outline: none;
  :focus {
    outline: rgb(102, 102, 102) solid 1px;
    z-index: 1;
  }
  padding-left: ${depth * 16}px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  text-align: left;
  cursor: pointer;
  width: 100%;

  label: ProjectTreeItemContainer;
`;

export const content = css`
  outline: none;
  display: flex;
  align-items: center;

  label: ProjectTreeItem;
`;

export const moreButton = (isActive: boolean): IButtonStyles => {
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

export const moreMenu: Partial<ICalloutContentStyles> = {
  root: {
    marginTop: '-7px',
    width: '100px',
  },
};

export const menuStyle: Partial<IContextualMenuStyles> = {
  subComponentStyles: {
    menuItem: {},
    callout: moreMenu,
  },
};

export const overflowSet = css`
  width: 100%;
  height: 100%;
  padding-left: 12px;
  padding-right: 12px;
  box-sizing: border-box;
  line-height: 36px;
  justify-content: space-between;
  display: flex;
  justify-content: space-between;
`;

export const styles = {
  dialog: {
    title: {
      fontWeight: FontWeights.bold,
      fontSize: FontSizes.size20,
      paddingTop: '14px',
      paddingBottom: '11px',
    },
    subText: {
      fontSize: FontSizes.size14,
    },
  },
  modal: {
    main: {
      maxWidth: '600px !important',
    },
  },
};

export const dropdownStyles = {
  label: {
    fontWeight: FontWeights.semibold,
  },
  dropdown: {
    width: '400px',
  },
  root: {
    marginBottom: '20px',
  },
};

export const dialogWindow = css`
  display: flex;
  flex-direction: column;
  width: 400px;
  min-height: 300px;
`;

export const textFieldlabel = {
  label: {
    root: [
      {
        fontWeight: FontWeights.semibold,
      },
    ],
  },
};

export const intent = {
  root: {
    width: '400px',
    paddingBottom: '20px',
  },
};

export const triggerPhrases = {
  root: {
    width: '400px',
  },
  fieldGroup: {
    height: 80,
  },
};

export const optionRow = {
  display: 'flex',
  height: 15,
  fontSize: 15,
};

export const warningIcon = {
  marginLeft: 5,
  color: SharedColors.red10,
  fontSize: 5,
};

export const warningText = {
  color: SharedColors.red10,
  fontSize: 5,
};
