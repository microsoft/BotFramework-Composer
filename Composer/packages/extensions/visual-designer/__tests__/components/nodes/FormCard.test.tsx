import React from 'react';
import { render, fireEvent } from 'react-testing-library';

import { FormCard } from '../../../src/components/nodes/templates/FormCard';
import { getElementColor } from '../../../src/utils/obiPropertyResolver';

describe('<FormCard />', () => {
  let renderResult, header, label, nodeColors, onClick;

  beforeEach(() => {
    header = 'InputFormCard';
    label = 'FormCard';
    nodeColors = getElementColor('Microsoft.SendActivity');

    onClick = jest.fn();

    renderResult = render(
      <FormCard nodeColors={nodeColors} header={header} label={label} corner={<div />} onClick={onClick} />
    );
  });

  it('can be clicked', async () => {
    const { findByTestId } = renderResult;
    const formCard = await findByTestId('FormCard');

    fireEvent.click(formCard);
    expect(onClick).toHaveBeenCalled();
  });
});
