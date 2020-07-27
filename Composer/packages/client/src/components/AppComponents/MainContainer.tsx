// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { SideBar } from './SideBar';
import { RightPanel } from './RightPanel';
import { Assistant } from './Assistant';

const main = css`
  height: calc(100vh - 50px);
  display: flex;
`;

export const MainContainer = () => {
  return (
    <div css={main}>
      <SideBar />
      <RightPanel />
      <Assistant />
    </div>
  );
};
