import React from 'react';
import { render } from 'react-testing-library';

import { Edge } from '../../../src/components/lib/EdgeComponents';

describe('<Edge />', () => {
  let direction, x, y, length, text;

  beforeEach(() => {
    x = y = 0;
    length = 100;
    text = 'edge';
  });

  it('renders horizontal edge when direction is x', async () => {
    direction = 'x';
    const { findByTestId } = render(<Edge direction={direction} x={x} y={y} length={length} text={text} />);

    const edge = await findByTestId('HorizontalEdge');

    expect(edge).toBeTruthy();
  });

  it('renders vertical edge when direction is y', async () => {
    direction = 'y';
    const { findByTestId } = render(<Edge direction={direction} x={x} y={y} length={length} text={text} />);

    const edge = await findByTestId('VerticalEdge');

    expect(edge).toBeTruthy();
  });
});
