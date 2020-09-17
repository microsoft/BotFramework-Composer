// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { ITextFieldProps, ITextFieldStyles, ITextFieldStyleProps } from 'office-ui-fabric-react/lib/TextField';

import { TextFieldBase } from './TextField.base';
import { getStyles } from './TextField.styles';

export const TextField: React.FunctionComponent<ITextFieldProps> = styled<
  ITextFieldProps,
  ITextFieldStyleProps,
  ITextFieldStyles
>(TextFieldBase, getStyles, undefined, {
  scope: 'TextField',
});
