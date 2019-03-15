import { css } from '@emotion/core';

export const container = variant => {
  let height = '350px';
  switch (variant) {
    case 'large':
      height = '500px';
      break;
    case 'largest':
      height = '870px';
      break;
    default:
      break;
  }

  return css`
    width: 325px;
    background-color: #ffffff;
    height: ${height};
    overflow: auto;
  `;
};

export const top = css`
  width: 100%;
  height: 10px;
  background-color: #e4efff;
`;
