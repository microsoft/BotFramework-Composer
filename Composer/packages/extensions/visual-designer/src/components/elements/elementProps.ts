// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ObiColors } from '../../constants/ElementColors';

export interface ElementProps {
  content: string;
  color: string;
}

export const defaultLinkElementProps = {
  content: '',
  color: ObiColors.AzureBlue,
  onClick: () => {},
};

export const defaultLineElementProps = {
  content: '',
  color: ObiColors.Black,
  line: 1,
};
export const defaultElementProps = {
  content: '',
  color: ObiColors.Black,
};
