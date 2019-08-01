import { css } from '@emotion/core';

export const collapseContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1008px;
  min-width: 432px;
  margin: 0 auto;
`;

export const collapseHeader = css`
  display: flex;
  align-items: center;
  width: 100%;
`;

export const headerText = css`
  color: #605e5c;
  font-size: 12px;
  line-height: 19px;
  height: 22px;
  margin-right: 20px;
`;

export const headerIcon = css`
  flex: 1;
  border: 0.5px solid #000000;
  transform: rotate(0.01deg);
`;

export const headerButton = collapsed => css`
  transform: ${collapsed ? 'rotate(270deg)' : 'rotate(90deg)'};
  margin-left: 12px;
  transition: transform 0.2s linear;
`;

export const collapseContent = collapsed =>
  css`
    display: ${collapsed ? 'none' : 'block'};
  `;
