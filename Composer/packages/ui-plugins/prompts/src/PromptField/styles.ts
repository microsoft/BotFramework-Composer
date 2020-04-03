// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IPivotStyles } from 'office-ui-fabric-react/lib/Pivot';
import { css } from '@emotion/core';

export const tabs: Partial<IPivotStyles> = {
  root: {
    display: 'flex',
    padding: '0 18px',
  },
  link: {
    flex: 1,
  },
  linkIsSelected: {
    flex: 1,
  },
  itemContainer: {
    padding: '12px 18px',
  },
};

export const settingsFields = css`
  display: flex;
  flex-wrap: wrap;
  position: relative;
  align-items: flex-end;

  label: SettingsField;
`;

export const settingsFieldHalf = css`
  flex: 1;
  overflow: hidden;

  label: SettingsFieldHalf;

  & + & {
    margin-left: 16px;
  }
`;
