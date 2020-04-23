// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors } from '@uifabric/fluent-theme';
import { css } from '@emotion/core';

export const headerContainer = css`
  position: relative;
  background: ${NeutralColors.black};
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const title = css`
  margin-left: 25px;
  font-weight: ${FontWeights.semibold};
  font-size: 16px;
  color: #fff;
  min-width: 200px;
`;

export const botName = css`
  margin-left: 15px;
  font-size: 16px;
  word-break: break-all;
  color: #fff;
`;

export const divider = css`
  height: 24px;
  border-right: 1px solid #979797;
  margin: 0px 0px 0px 4px;
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
