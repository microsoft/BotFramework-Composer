// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { IDropdownStyles } from 'office-ui-fabric-react/lib/Dropdown';

export const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 80 },
};

export const container = css`
  display: flex;
  width: 400px;
  height: 45px;
  padding-top: 5px;
  line-height: 30px;
  background-color: transparent;
  justify-content: space-around;
`;

export const text = css`
  font-size: 12px;
  cursor: default;
`;
