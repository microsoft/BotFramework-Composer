import { css } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';

export const headerSub = css`
  padding: 5px 20px 5px 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${NeutralColors.gray30};
`;

export const bot = css`
  display: flex;
  align-items: center;
  position: relative;
`;

export const botButton = css`
  margin-left: 15px;
`;

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

export const calloutContainer = css`
  width: 400px;
  padding: 10px;
`;

export const calloutLabel = css`
  font-size: ${FontSizes.large};
  font-weight: ${FontWeights.bold};
`;

export const calloutDescription = css``;

export const calloutAction = css``;
