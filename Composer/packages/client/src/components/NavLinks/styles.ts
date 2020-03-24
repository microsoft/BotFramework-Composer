// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors } from '@uifabric/fluent-theme';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';

export const dialogItemNotSelected: IButtonStyles = {
  root: {
    background: NeutralColors.white,
    fontWeight: FontWeights.semilight,
    height: '32px',
    fontSize: FontSizes.small,
    paddingLeft: '16px',
    paddingRight: 0,
    border: 0,
    textAlign: 'left',
    marginLeft: 0,
    marginRight: 0,
  },
};
export const dialogItemSelected: IButtonStyles = {
  root: {
    background: NeutralColors.gray20,
    fontWeight: FontWeights.semibold,
    height: '32px',
    fontSize: FontSizes.small,
    paddingLeft: '16px',
    paddingRight: 0,
    border: 0,
    textAlign: 'left',
    marginLeft: 0,
    marginRight: 0,
  },
};
