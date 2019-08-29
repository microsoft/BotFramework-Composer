import { css } from '@emotion/core';
import { FontWeights } from '@uifabric/styling';

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

export const navItem = selected => css`
  width: 100%;
  font-size: 12px;
  color: #605e5c;
  padding-left: 12px;
  background: ${selected ? '#f2f2f2' : 'transparent'};
  font-weight: ${selected ? FontWeights.semibold : FontWeights.regular};
  &: hover {
    color: #605e5c;
    background: #f2f2f2;
  }
`;

export const itemText = css`
  max-width: 130px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const moreButton = {
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

export const moreMenu = {
  root: {
    marginTop: '-7px',
    width: '100px',
  },
};

export const overflowSet = css`
  width: 100%;
  height: 100%;
  line-height: 40px;
  justify-content: space-between;
  & : hover {
    .dialog-more-btn {
      visibility: visible;
    }
  }
`;

export const addButton = css`
  font-size: 12px;
  color: #0078d4;
`;
