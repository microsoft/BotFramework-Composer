// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';

import { main } from './styles';
import { SideBar } from './SideBar';
import { RightPanel } from './RightPanel';
import { Assistant } from './Assistant';

export const MainContainer = () => {
  return (
    <div css={main}>
      <SideBar />
      <RightPanel />
      <Assistant />
    </div>
  );
};
