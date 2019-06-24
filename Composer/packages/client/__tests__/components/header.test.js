import * as React from 'react';
import { render } from 'react-testing-library';

import { Header } from '../../src/components/Header';

describe('<Header />', () => {
  it('should render the header', () => {
    const { container } = render(<Header />);

    expect(container).toHaveTextContent('Bot Framework Designer');
  });
});
