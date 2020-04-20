// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontSizes } from '@uifabric/fluent-theme';
import { ILinkStyles } from 'office-ui-fabric-react/lib/Link';

export const container = css`
  padding: 16px;

  h1 {
    margin: 0;
  }

  label: SettingsContainer;
`;

export const section = css`
  h2 {
    margin-top: 20px;
    margin-bottom: 5px;
    font-size: ${FontSizes.size18};
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
