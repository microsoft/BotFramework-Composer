// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IPivotStyles } from 'office-ui-fabric-react/lib/Pivot';
import { css } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';

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
    padding: '12px 12px',
  },
};

export const validationItemInput = css`
  display: flex;
  align-items: center;
  padding-left: 10px;
`;

export const validationItem = css`
  ${validationItemInput}

  border-bottom: 1px solid ${NeutralColors.gray30};

  &:first-of-type {
    border-top: 1px solid ${NeutralColors.gray30};
  }
`;

export const validationItemValue = css`
  flex: 1;
  min-width: 0;
`;

export const field = css`
  margin: 10px 0;
`;

export const settingsContainer = css`
  /* padding: 24px 0; */
`;

export const settingsFields = css`
  display: flex;
  flex-wrap: wrap;
  position: relative;
  align-items: flex-end;
`;

export const settingsFieldFull = css`
  flex-basis: 100%;
  overflow: hidden;
`;

export const settingsFieldHalf = css`
  flex: 1;
  overflow: hidden;

  & + & {
    margin-left: 36px;
  }
`;

export const settingsFieldInline = css`
  margin: 0;
`;

export const settingsFieldValidation = css`
  margin-top: -10px;
`;

export const choiceItemContainer = (align = 'center') => css`
  display: flex;
  align-items: ${align};
`;

export const choiceField = css`
  margin-bottom: 7px;
`;

export const choiceItem = css`
  border-bottom: 1px solid ${NeutralColors.gray30};
`;

export const choiceItemValue = css`
  flex: 1;

  & + & {
    margin-left: 20px;
  }
`;

export const choiceItemLabel = css`
  border-bottom: 1px solid ${NeutralColors.gray30};
  padding-bottom: 7px;
`;

export const choiceItemValueLabel = css`
  color: ${NeutralColors.gray130};
  font-size: 12px;
  margin-left: 7px;
`;
