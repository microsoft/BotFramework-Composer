import { css } from '@emotion/core';
import { SharedColors } from '@uifabric/fluent-theme';

export const container = css`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const childrenUl = isOpen => {
  return css`
    list-style: none;
    padding: 0;
    margin: 0;
    display: ${isOpen ? 'inherit' : 'none'};
  `;
};

export const folderItem = active => {
  return css`
    cursor: default;
    color: ${active ? SharedColors.cyanBlue10 : 'inherit'};
    font-weight: ${active ? 'bold' : 'normal'};
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;

    &:hover {
      font-weight: bold;
    }
  `;
};

export const nodeItem = id => {
  return css`
    padding: 7px 10px;
    padding-left: ${id === 0 ? '15px' : '25px'};
  `;
};
