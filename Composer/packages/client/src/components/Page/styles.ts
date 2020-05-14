// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';

export const root = css`
  height: calc(100vh - 50px);
  display: flex;
  flex-direction: row;

  label: Page;
`;

export const pageWrapper = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  label: PageWrapper;
`;

export const header = css`
  padding: 5px 20px;
  height: 60px;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  align-items: center;

  label: PageHeader;
`;

export const headerTitle = css`
  font-size: ${FontSizes.xLarge};
  font-weight: ${FontWeights.semibold};

  label: PageHeaderTitle;
`;

export const headerContent = css`
  display: flex;
  align-items: center;

  label: PageHeaderContent;
`;

export const main = css`
  margin-left: 2px;
  height: calc(100vh - 180px);
  display: flex;
  border-top: 1px solid #dddddd;
  position: relative;
  nav {
    ul {
      margin-top: 0px;
    }
  }

  label: PageMain;
`;

export const content = css`
  flex: 4;
  margin: 20px;
  position: relative;
  overflow: visible;

  label: PageContent;
`;
