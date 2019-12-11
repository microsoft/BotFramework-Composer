// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FunctionComponent } from 'react';
import formatMessage from 'format-message';

import { NodeProps, defaultNodeProps } from '../types/nodeProps';

import buildEventRenderer from './buildEventRenderer';

// Generate the title displayed in the graph
// If a custom title has been specified, use this
// otherwise, displays a generic message about the unknown intent rule.
function renderTitle(data): string {
  if (data.$designer && data.$designer.name) {
    return data.$designer.name;
  } else {
    // data.$type.split('.')[1]
    return formatMessage('Handle Unknown Intent');
  }
}

export const UnknownIntentRule: FunctionComponent<NodeProps> = buildEventRenderer(renderTitle);

UnknownIntentRule.defaultProps = defaultNodeProps;
