import { css } from '@emotion/core';

export const iconCss = (size, color) => {
  return css`
    transform: scale(${size / 18})};
    width: 18px;
    height: 18px;
    border-radius: 37.5px;
    background-color: ${color || 'black'};
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  `;
};
