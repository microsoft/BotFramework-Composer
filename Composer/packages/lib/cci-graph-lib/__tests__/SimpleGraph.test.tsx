import * as React from 'react';
import { cleanup, render } from 'react-testing-library';

import { SimpleGraph } from '../src/examples/simple/SimpleGraph';

describe('<SimpleGraph />', () => {
  afterEach(cleanup);

  it('should render a simple graph', async () => {
    const { container } = render(<SimpleGraph items={[]} />);
    const graphContainer = container.querySelector('.graph-container');
    expect(graphContainer).toBeTruthy();
  });
});
