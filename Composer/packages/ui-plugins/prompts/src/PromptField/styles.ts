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
    padding: '24px 18px',
  },
};

export const tabsContainer = css`
  border-bottom: 1px solid #c8c6c4;
`;

export const settingsContainer = css`
  padding: 10px 18px;

  label: PromptSettings;
`;

export const settingsHeader = css`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 11px;

  label: PromptSettingsHeader;
`;

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
    margin-left: 36px;
  }
`;
