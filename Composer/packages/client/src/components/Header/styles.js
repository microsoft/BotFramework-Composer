import { css } from '@emotion/core';
import { SharedColors } from '@uifabric/fluent-theme';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';

export const headerContainer = css`
  position: relative;
  background: ${SharedColors.cyanBlue10};
  height: 50px;
  line-height: 50px;
`;

export const title = css`
  position: relative;
  margin-left: 50px;
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
    border-right: 1px solid #005292;
    border-image: initial;
    outline: none;
  }
`;

export const botName = css`
  margin-left: 30px;
  font-size: 16px;
  color: #fff;
`;
