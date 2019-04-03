import { css } from '@emotion/core';

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
    color: ${active ? '#0083cb' : '#4f4f4f'};
    font-weight: ${active ? 'bold' : 'normal'};
    &:hover {
      font-weight: bold;
    }
  `;
};

export const nodeItem = id => {
  return css`
    padding-left: ${id === 0 ? '15px' : '25px'};
  `;
};
