/* eslint-disable prettier/prettier */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { mergeStyleSets, FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';

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
