import { css } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';

export const headerSub = css`
  height: 44px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${NeutralColors.gray30};
`;

export const leftActions = css`
  position: relative;
  display: flex;
  align-items: stretch;
  height: 44px;
`;

export const rightActions = css`
  position: relative;
  height: 44px;
  margin-right: 20px;
`;

export const actionButton = css`
  font-size: 16px;
  margin-top: 2px;
  margin-left: 15px;
`;
