import { css } from '@emotion/core';
import { FontWeights } from '@uifabric/styling';
import { IButtonStyles, ICalloutContentStyles } from 'office-ui-fabric-react';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
export const root = css`
  width: 180px;
  border-right: 1px solid #c4c4c4;
  box-sizing: border-box;
  overflow-y: auto;

  ul,
  li {
    list-style: none;
    padding: 0px;
    margin: 0px;
  }
`;

export const navItem = (isActive: boolean, depth: number) => css`
  width: 100%;
  position: relative;
  font-size: 12px;
  color: #605e5c;
  background: ${isActive && depth !== 0 ? '#f2f2f2' : 'transparent'};
  font-weight: ${isActive ? FontWeights.semibold : FontWeights.regular};
  &: hover {
    color: #605e5c;
    background: #f2f2f2;
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
  padding-left: ${depth * 16}px;
  width: ${depth === 0 ? 130 : 120}px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  text-align: left;
`;

export const moreButton: IButtonStyles = {
  root: {
    padding: '0 4px',
    alignSelf: 'stretch',
    height: 'auto',
    visibility: 'hidden',
    width: '16px',
  },
  menuIcon: {
    fontSize: '14px',
    color: '#000',
  },
};

export const moreMenu: Partial<ICalloutContentStyles> = {
  root: {
    marginTop: '-7px',
    width: '100px',
  },
};

export const overflowSet = css`
  width: 100%;
  height: 100%;
  padding-left: 12px;
  box-sizing: border-box;
  line-height: 40px;
  justify-content: space-between;
  & : hover {
    .dialog-more-btn {
      visibility: visible;
    }
  }
`;

export const addButton = (depth: number) => css`
  margin-left: ${depth * 16}px;
  font-size: 12px;
  color: #0078d4;
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
      maxWidth: '416px !important',
    },
  },
};

export const dropdownStyles = css`
  dropdown: {
    width: 300;
  }
`;
