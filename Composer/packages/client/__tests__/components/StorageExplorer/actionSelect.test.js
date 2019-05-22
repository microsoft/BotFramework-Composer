import * as React from 'react';
import { cleanup, fireEvent, render, waitForElement } from 'react-testing-library';

import { ActionSelector } from './../../../src/components/StorageExplorer/ActionSelector/index';

describe('<ActionSelect/>', () => {
  afterEach(cleanup);
  it('should render the new storage modal', () => {
    const { container } = render(<ActionSelector />);

    expect(container).toHaveTextContent(/New/);
    expect(container).toHaveTextContent(/Open/);
    expect(container).toHaveTextContent(/Save As/);
  });

  it('should close the explorer', async () => {
    const mockOnLinkClick = jest.fn(() => null);
    const { getByText } = render(<ActionSelector onLinkClick={mockOnLinkClick} />);
    const newButton = await waitForElement(() => getByText(/New/));
    const openButton = await waitForElement(() => getByText(/Open/));
    const saveButton = await waitForElement(() => getByText(/Save As/));
    fireEvent.click(newButton);
    fireEvent.click(openButton);
    fireEvent.click(saveButton);
    expect(mockOnLinkClick).toHaveBeenCalledTimes(3);
  });
});
