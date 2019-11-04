// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';

import { TerminatorSize } from '../../constants/ElementSizes';

export const Terminator = (): JSX.Element => (
  <div css={{ ...TerminatorSize, border: '2px solid #A4A4A4', borderRadius: '14px' }} />
);
