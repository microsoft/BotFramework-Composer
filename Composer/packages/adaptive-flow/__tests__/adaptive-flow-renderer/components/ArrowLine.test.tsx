// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';

import { ArrowLine } from '../../../src/adaptive-flow-renderer/components/ArrowLine';

describe('<ArrowLine />', () => {
  it('can be rendered as svg polyline', () => {
    const arrowLine = render(<ArrowLine arrowsize={5} width={100} />);
    expect(arrowLine.baseElement.getElementsByTagName('svg')).toHaveLength(1);
    expect(arrowLine.baseElement.getElementsByTagName('polyline')).toHaveLength(1);
  });
});
