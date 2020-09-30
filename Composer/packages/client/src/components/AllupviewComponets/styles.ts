/* eslint-disable prettier/prettier */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { mergeStyleSets, FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { SharedColors } from '@uifabric/fluent-theme';

// import { getTheme } from 'office-ui-fabric-react/lib/Styling';
// const theme = getTheme();

export const AddTemplateButton = {
  root: {
    fontSize: FontSizes.smallPlus,
    marginLeft: 64,
    color: SharedColors.cyanBlue10,
  },
};

export const classNames = mergeStyleSets({
  groupHeader: {
    display: 'flex',
    fontSize: FontSizes.large,
    fontWeight: FontWeights.regular,
    alignItems: 'center',
  },
  emptyTableList: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  emptyTableListCenter: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    width: '50%',
    textAlign: 'center',
    marginTop: '-20%',
  },
});
