import { css } from '@emotion/core';

export const iconCss = (size: number, color?: string) => {
  return css`
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background-color: ${color || 'black'};
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  `;
};
