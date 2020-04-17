// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
export const outline = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 32px 50px 0px 32px;
  border: 1px solid #979797;
  overflow-x: auto;
`;

export const content = css`
  height: 100%;
`;

export const title = css`
  display: block;
  height: 36px;
  margin: 33px 0px 0px 42px;
  font-size: ${FontSizes.xLarge};
  font-weight: ${FontWeights.semibold};
  line-height: 32px;
`;

export const body = css`
  width: auto;
  margin-top: 26px;
  margin-left: 60px;
`;

export const version = css`
  font-size: ${FontSizes.large};
  font-weight: ${FontWeights.regular};
  line-height: 32px;
`;

export const description = css`
  font-size: ${FontSizes.mediumPlus};
  font-weight: ${FontWeights.regular};
  line-height: 32px;
  width: 50%;
  margin-top: 20px;
`;

export const DiagnosticsText = css`
  width: 50%;
  font-size: 24px;
  margin-top: 20px;
`;

export const smallText = css`
  margin-top: 20px;
  font-size: 13px;
`;
export const DiagnosticsInfoText = css`
  display: flex;
  justify-content: space-between;
  width: 550px;
  font-size: 24px;
`;

export const DiagnosticsInfoTextAlignLeft = css`
  text-align: left;
  font-size: ${FontSizes.mediumPlus};
  font-weight: ${FontWeights.semibold};
`;

export const DiagnosticsInfo = css`
  margin-top: 40px;
`;

export const linkContainer = css`
  display: flex;
  margin-left: 35px;
  flex-direction: column;
  height: 110px;
  margin-top: 15px;
`;

export const linkTitle = css`
  font-size: 24px;
`;

export const linkRow = css`
  display: flex;
  width: 400px;
  align-items: center;
  padding-bottom: 6px;
`;

export const link = {
  root: {
    fontSize: FontSizes.mediumPlus,
    fontWeight: FontWeights.regular,
    color: '#0078d4',
    marginLeft: '10px',
    textDecoration: 'underline',
  },
};

export const helpLink = {
  root: {
    fontSize: FontSizes.mediumPlus,
    fontWeight: FontWeights.regular,
    color: '#0078d4',
    marginLeft: '60px',
    textDecoration: 'underline',
  },
};

export const icon = {
  root: {
    color: '#0078d4',
    fontSize: '20px',
  },
};
