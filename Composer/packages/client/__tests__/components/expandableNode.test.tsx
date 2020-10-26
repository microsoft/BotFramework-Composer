// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent } from '@botframework-composer/test-utils';

import { ExpandableNode } from '../../src/components/ProjectTree/ExpandableNode';

function isShown(details: HTMLElement) {
  if (details == null) return false;
  return details.attributes.getNamedItem('open') != null;
}

describe('<ExpandableNode />', () => {
  let component;
  beforeEach(() => {
    component = render(<ExpandableNode summary={'Summary'}>{'details'}</ExpandableNode>);
  });

  it('closes and opens on click', async () => {
    const triangle = await component.findByTestId('summaryTag');
    let details = await component.findAllByText('details');
    expect(isShown(details[0])).toEqual(true);

    fireEvent.click(triangle);
    details = await component.findAllByText('details');
    expect(isShown(details[0])).toEqual(false);

    fireEvent.click(triangle);
    details = await component.findAllByText('details');
    expect(isShown(details[0])).toEqual(true);
  });
});
