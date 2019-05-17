import * as React from 'react';
import { fireEvent, render } from 'react-testing-library';

import { ActionSelector } from './../../../src/components/StorageExplorer/ActionSelector/index';

describe('<ActionSelect/>', () => {
  it('should render the new storage modal', () => {
    const { container } = render(<ActionSelector />);

    expect(container).toHaveTextContent(/New/);
    expect(container).toHaveTextContent(/Open/);
    expect(container).toHaveTextContent(/Save As/);
  });

  it('should close the explorer', () => {
    const mockOnLinkClick = jest.fn(() => null);
    const { getByText } = render(<ActionSelector onLinkClick={mockOnLinkClick} />);
    fireEvent.click(getByText('New'));
    fireEvent.click(getByText('Open'));
    fireEvent.click(getByText('Save As'));
    expect(mockOnLinkClick).toHaveBeenCalledTimes(3);
  });
});
