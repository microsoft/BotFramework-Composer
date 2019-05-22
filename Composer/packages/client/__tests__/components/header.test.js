import * as React from 'react';
import { fireEvent, render } from 'react-testing-library';

import { Header } from '../../src/components/Header';

describe('<Header />', () => {
  it('should render the header', () => {
    const { container } = render(<Header />);

    expect(container).toHaveTextContent('Bot Framework Designer');
    expect(container).toHaveTextContent('New');
    expect(container).toHaveTextContent('Open');
    expect(container).toHaveTextContent('Save as');
    expect(container).toHaveTextContent('Start');
  });

  it('should open storage explorer', async () => {
    const mockOpenStorageExplorer = jest.fn(() => null);
    const { findByText } = render(<Header openStorageExplorer={mockOpenStorageExplorer} />);
    const openButton = await findByText(/Open/);
    const saveButton = await findByText(/Save as/);
    fireEvent.click(openButton);
    fireEvent.click(saveButton);
    expect(mockOpenStorageExplorer).toHaveBeenCalledTimes(2);
  });

  it('should open new bot modal', async () => {
    const mockOpenNewModal = jest.fn(() => null);
    const { findByText } = render(<Header openNewModal={mockOpenNewModal} />);
    const newButton = await findByText(/New/);
    fireEvent.click(newButton);
    expect(mockOpenNewModal).toHaveBeenCalledTimes(1);
  });

  it('should set bot status', async () => {
    const mockSetBotStatus = jest.fn(() => null);
    const { findByText, rerender } = render(<Header setBotStatus={mockSetBotStatus} botStatus={'stopped'} />);

    const startButton = await findByText(/Start/);
    fireEvent.click(startButton);
    expect(mockSetBotStatus).toHaveBeenCalled();

    rerender(<Header setBotStatus={mockSetBotStatus} botStatus={'running'} />);
    const connectButton = await findByText(/Connect and Test/);
    fireEvent.click(connectButton);
  });
});
