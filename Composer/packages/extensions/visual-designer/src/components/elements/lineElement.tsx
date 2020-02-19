// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';

import { ElementProps, defaultLineElementProps } from './elementProps';
export interface LineElementProps extends ElementProps {
  line?: number;
}

/**
 * A basic element component to show one or multiple line content.
 * default line is 1
 * if content line number is over line, then truncate the content.
 */
export default function LineElement(props: LineElementProps) {}
LineElement.defaultProps = defaultLineElementProps;
