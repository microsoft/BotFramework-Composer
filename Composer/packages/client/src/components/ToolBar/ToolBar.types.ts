// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IContextualMenuProps, IIconProps } from 'office-ui-fabric-react/lib';

export type IToolBarItem = {
  type: string;
  element?: any;
  text?: string;
  buttonProps?: {
    iconProps?: IIconProps;
    onClick?: () => void;
  };
  menuProps?: IContextualMenuProps;
  align?: string;
  dataTestid?: string;
  disabled?: boolean;
};
