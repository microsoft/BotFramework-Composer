// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent, RenderResult } from '@botframework-composer/test-utils';

import { ExpandableNode } from '../../src/components/ProjectTree/ExpandableNode';

describe('<ExpandableNode />', () => {
  let component: RenderResult | null = null;
  beforeEach(() => {
    component = render(<ExpandableNode summary={'Summary'}>{'details'}</ExpandableNode>) as RenderResult;
  });

  it('closes and opens on click', async () => {
    if (component == null) fail();
    const triangle = await component.findByTestId('summaryTag');
    let details = await component.findByTestId('dialog');
    expect(details.attributes.getNamedItem('open')).not.toBeNull();

    fireEvent.click(triangle);
    details = await component.findByTestId('dialog');
    expect(details.attributes.getNamedItem('open')).toBeNull();

    fireEvent.click(triangle);
    details = await component.findByTestId('dialog');
    expect(details.attributes.getNamedItem('open')).not.toBeNull();
  });
});
