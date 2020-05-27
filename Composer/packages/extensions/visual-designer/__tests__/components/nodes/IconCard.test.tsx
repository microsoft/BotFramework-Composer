// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent } from '@bfc/test-utils';

import { IconCard } from '../../../src/components/nodes/templates/IconCard';

describe('<IconCard />', () => {
  let renderResult, icon, label, corner, themeColor, onClick;

  beforeEach(() => {
    icon = 'MessageBot';
    label = 'Intent';
    corner = <div />;
    themeColor = '#BFEAE9';
    onClick = jest.fn();

    renderResult = render(
      <IconCard
        childDialog={''}
        corner={corner}
        icon={icon}
        iconColor={'red'}
        label={label}
        summary={''}
        themeColor={themeColor}
        trigger={''}
        onChildDialogClick={() => {}}
        onClick={onClick}
      />
    );
  });

  it('can be clicked', async () => {
    const { findByTestId } = renderResult;
    const iconCard = await findByTestId('IconCard');

    fireEvent.click(iconCard);
    expect(onClick).toHaveBeenCalled();
  });
});
