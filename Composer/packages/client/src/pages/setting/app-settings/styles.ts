// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontSizes, NeutralColors } from '@uifabric/fluent-theme';
import { ILinkStyles } from 'office-ui-fabric-react/lib/Link';
import { FontWeights } from '@uifabric/styling';

export const container = css`
  label: SettingsContainer;
  width: 700px;
`;

export const section = css`
  h2 {
    margin: 20px 0;
    font-size: ${FontSizes.size16};
    font-weight: ${FontWeights.semibold};
  }
`;

export const title = css`
  font-size: ${FontSizes.size24};
  font-weight: semibold;

  label: SettingsTitle;
`;

export const description = css`
  font-size: ${FontSizes.size12};
  margin: 5px 0;
`;

export const link: ILinkStyles = {
  root: {
    marginLeft: '5px',
  },
};

export const settingsContainer = css`
  display: flex;
  border-top: 1px solid ${NeutralColors.gray20};
  padding: 20px 0px;
  width: 100%;
`;

export const settingsContent = css`
  width: 245px;
  margin-left: 32px;
  margin-right: 300px;
  font-size: ${FontSizes.size14};
`;

export const settingsDescription = css`
  margin: 0;
  margin-top: 8px;
`;

export const image = css`
  width: 86px;
`;

export const labelContainer = css`
  display: flex;
  flex-direction: row;
`;

export const customerLabel = css`
  font-size: ${FontSizes.size12};
  margin-right: 5px;
`;

export const icon = {
  root: {
    fontSize: FontSizes.size12,
  },
};

export const featureFlagGroupContainer = css`
  margin-left: 166px;
  font-size: ${FontSizes.size12};
`;

export const featureFlagContainer = css`
  margin-bottom: 15px;
`;

export const featureFlagTitle = css`
  font-weight: ${FontWeights.semibold};
`;

export const noFeatureFlagText = css`
  font-size: ${FontSizes.size14};
  font-style: italic;
`;
