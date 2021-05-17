// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { FluentTheme } from '@uifabric/fluent-theme';
import {
  FontWeights,
  FontSizes,
  IStackItemStyles,
  IStackTokens,
  ScrollablePane,
  ScrollbarVisibility,
  Stack,
  Text,
  Label,
  TextField,
} from 'office-ui-fabric-react';

export const ConfigureResourcesSectionName = styled(Text)`
  font-size: ${FluentTheme.fonts.mediumPlus.fontSize};
  font-weight: ${FontWeights.semibold};
  margin-bottom: 4px;
`;

export const ConfigureResourcesSectionDescription = styled(Text)`
  font-size: ${FluentTheme.fonts.medium.fontSize};
  line-height: ${FontSizes.size14};
  margin-bottom: 20px;
`;

export const ConfigureResourcesPropertyLabel = styled(Label)`
  font-size: ${FluentTheme.fonts.medium.fontSize};
  font-weight: ${FontWeights.regular};
`;

export const configureResourceTextFieldStyles = {
  root: {
    paddingBottom: '4px',
    width: '300px',
  },
};

export const configureResourceDropdownStyles = {
  root: {
    paddingBottom: '4px',
    width: '300px',
  },
};

export const configureResourcePropertyStackTokens: IStackTokens = {
  childrenGap: 5,
};

export const configureResourcePropertyLabelStackStyles: IStackItemStyles = {
  root: {
    width: '200px',
  },
};
