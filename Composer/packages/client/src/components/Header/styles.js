import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors } from '@uifabric/fluent-theme';
import { css } from '@emotion/core';

export const headerContainer = css`
  position: relative;
  background: ${NeutralColors.black};
  height: 50px;
  line-height: 50px;
`;

export const title = css`
  position: relative;
  margin-left: 56px;
  font-weight: ${FontWeights.semibold};
  font-size: 16px;
  color: #fff;
  &::after {
    content: '';
    position: absolute;
    top: 0px;
    right: -15px;
    bottom: 0px;
    width: 0px;
    height: 24px;
    border: none;
    border-right: 1px solid #979797;
    border-image: initial;
    outline: none;
  }
`;

export const botName = css`
  margin-left: 30px;
  font-size: 16px;
  color: #fff;
`;
