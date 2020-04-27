// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { css } from '@emotion/core';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors } from '@uifabric/fluent-theme';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';

export const root = css`
  width: 100%;
  height: 100%;
  border-right: 1px solid #c4c4c4;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  .ms-List-cell {
    min-height: 36px;
  }
`;

const dialogItem: IButtonStyles = {
  root: {
    background: NeutralColors.white,
    fontWeight: FontWeights.semilight,
    height: '32px',
    width: '100%',
    fontSize: FontSizes.small,
    paddingLeft: '16px',
    paddingRight: 0,
    border: 0,
    textAlign: 'left',
    marginLeft: 0,
    marginRight: 0,
  },
};

export const dialogItemNotSelected: IButtonStyles = mergeStyleSets(dialogItem, {
  root: {
    background: NeutralColors.white,
    fontWeight: FontWeights.semilight,
  },
});
export const dialogItemSelected: IButtonStyles = mergeStyleSets(dialogItem, {
  root: {
    background: NeutralColors.gray20,
    fontWeight: FontWeights.semibold,
  },
});
