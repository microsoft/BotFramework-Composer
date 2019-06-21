import { css } from '@emotion/core';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';

export const headerMain = css`
  position: relative;
  line-height: 50px;
  background: ${SharedColors.cyanBlue10};
  font-size: 16px;
  color: #fff;
  height: 50px;
`;

export const headerSub = css`
  padding: 5px 20px 5px 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${NeutralColors.gray30};
`;

export const aside = css`
  margin-left: 50px;
`;

export const bot = css`
  display: flex;
  align-items: center;
`;

export const botButton = css``;

export const botMessage = css`
  margin-left: 5px;
  font-size: 18px;
`;

export const actionButton = css`
  font-size: 16px;
  margin-top: 2px;

  & + & {
    margin-left: 15px;
  }
`;

export const fileInput = css`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`;

export const warningContiner = css`
  margin-right: 20px;
  font-size: 14px;
`;

export const warningIcon = css`
  margin-right: 5px;
  color: ${SharedColors.orange20};
`;
