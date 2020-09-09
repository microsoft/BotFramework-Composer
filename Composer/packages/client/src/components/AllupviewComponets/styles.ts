/* eslint-disable prettier/prettier */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { mergeStyleSets, FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';

// import { getTheme } from 'office-ui-fabric-react/lib/Styling';
// const theme = getTheme();

export const AddTemplateButton = {
  root: {
    fontSize: FontSizes.smallPlus,
    margin: '0 1em',
    color: SharedColors.cyanBlue10,
  },
  icon: {
    fontSize: FontSizes.xSmall,
  },
};

export const classNames = mergeStyleSets({
  groupHeader: {
    display: 'flex',
    fontSize: FontSizes.large,
    fontWeight: FontWeights.regular,
    alignItems: 'center',
  },
  groupHeaderSourceName: {
    display: 'flex',
    margin: '0 1em',
  },
});
