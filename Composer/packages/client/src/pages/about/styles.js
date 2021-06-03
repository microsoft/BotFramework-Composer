// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';

import { colors } from '../../colors';

export const content = css`
  height: 100%;
`;

export const body = css`
  width: auto;
  margin-top: 26px;
  margin-left: 60px;
`;

export const version = css`
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.regular};
  line-height: 32px;
`;

export const diagnosticsText = css`
  width: 50%;
  font-size: 24px;
  margin-top: 20px;
`;

export const smallText = css`
  margin: 20px 20px 20px 0;
  font-size: 14px;
`;

export const smallerText = css`
  margin: 20px 20px 20px 0;
  font-size: 12px;
`;

export const diagnosticsInfoText = css`
  display: flex;
  justify-content: space-between;
  width: 550px;
  font-size: 24px;
`;

export const diagnosticsInfoTextAlignLeft = css`
  text-align: left;
  font-size: ${FontSizes.mediumPlus};
  font-weight: ${FontWeights.semibold};
`;

export const diagnosticsInfo = css`
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
    color: colors.main,
    marginLeft: '10px',
    textDecoration: 'underline',
  },
};

export const helpLink = {
  root: {
    fontSize: FontSizes.mediumPlus,
    fontWeight: FontWeights.regular,
    color: colors.main,
    marginLeft: '60px',
    textDecoration: 'underline',
  },
};

export const icon = {
  root: {
    color: colors.main,
    fontSize: '20px',
  },
};
