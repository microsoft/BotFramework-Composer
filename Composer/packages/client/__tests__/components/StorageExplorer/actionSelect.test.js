import * as React from 'react';
import { fireEvent, render } from 'react-testing-library';

import { ActionSelector } from './../../../src/components/StorageExplorer/ActionSelector/index';

describe('<ActionSelect/>', () => {
  it('should render the new storage modal', () => {
    const { container } = render(<ActionSelector />);

    expect(container).toHaveTextContent(/Open/);
    expect(container).toHaveTextContent(/Save As/);
  });

  it('should close the explorer', async () => {
    const mockOnLinkClick = jest.fn(() => null);
    const { findByText } = render(<ActionSelector onLinkClick={mockOnLinkClick} />);
    const openButton = await findByText(/Open/);
    const saveButton = await findByText(/Save As/);
    fireEvent.click(openButton);
    fireEvent.click(saveButton);
    expect(mockOnLinkClick).toHaveBeenCalledTimes(2);
  });
});
