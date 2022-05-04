// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* istanbul ignore file */

/** @jsx jsx */
import { jsx } from '@emotion/react';
import React from 'react';
import { Link as FluentLink, ILinkProps } from '@fluentui/react/lib/Link';

import { focusBorder } from './sharedStyles';

const Link: React.FC<ILinkProps> = (props) => {
  return (
    <FluentLink css={focusBorder} {...props}>
      {props.children}
    </FluentLink>
  );
};

export { Link };
