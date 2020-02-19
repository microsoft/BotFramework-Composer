// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';

import { ElementProps, defaultLinkElementProps } from './elementProps';
export interface LinkElementProps extends ElementProps {
  onClick?: () => any;
}

/**
 * A basic element for displaying link content
 */
export default function LinkElement(props: LinkElementProps) {}
LinkElement.defaultProps = defaultLinkElementProps;
