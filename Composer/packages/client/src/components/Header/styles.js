// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors } from '@uifabric/fluent-theme';
import { css } from '@emotion/core';

export const headerContainer = css`
  position: relative;
  background: ${NeutralColors.black};
  height: 50px;
  line-height: 50px;
`;

export const title = botName => css`
  position: relative;
  margin-left: 25px;
  font-weight: ${FontWeights.semibold};
  font-size: 16px;
  color: #fff;
  bottom: 11px;
  &::after {
    content: '';
    position: absolute;
    top: 0px;
    right: -15px;
    bottom: 11px;
    width: 0px;
    height: 24px;
    border: none;
    border-right: ${botName && '1px solid #979797;'}
    border-image: initial;
    outline: none;
  }
`;

export const botName = css`
  position: absolute;
  margin-left: 30px;
  font-size: 16px;
  color: #fff;
`;

export const updateAvailableIcon = {
  icon: {
    color: '#FFF',
    fontSize: '20px',
  },
  root: {
    position: 'absolute',
    height: '20px',
    width: '20px',
    top: 'calc(50% - 10px)',
    right: '20px',
  },
  rootHovered: {
    backgroundColor: 'transparent',
  },
  rootPressed: {
    backgroundColor: 'transparent',
  },
};
