// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';

import { getDefaultFontSettings } from '../../../../../recoilModel/utils/fontUtil';

export const clickableSegment = css`
  text-decoration: underline;
  color: ${SharedColors.blue10};
  cursor: pointer;
  display: inline-block;
  padding-right: 4px;
`;

export const emphasizedText = css`
  color: ${NeutralColors.black};
`;

export const hoverItem = (isActive: boolean) => css`
  padding: 0 16px;
  background-color: ${isActive ? colors.gray(30) : NeutralColors.white};
  &:hover {
    background-color: ${isActive ? colors.gray(40) : colors.gray(20)};
  }
`;

const DEFAULT_FONT_SETTINGS = getDefaultFontSettings();
export const logItem = css`
  font-size: 12px;
  font-family: ${DEFAULT_FONT_SETTINGS.fontFamily};
  line-height: 16px;
  word-break: break-all;
`;
