import * as React from 'react';
import { cleanup, fireEvent, render, waitForElement } from 'react-testing-library';

import { Header } from '../../src/components/Header';

describe('<Header />', () => {
  afterEach(cleanup);

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
    const { getByText } = render(<Header openStorageExplorer={mockOpenStorageExplorer} />);
    const newButton = await waitForElement(() => getByText(/New/));
    const openButton = await waitForElement(() => getByText(/Open/));
    const saveButton = await waitForElement(() => getByText(/Save as/));
    fireEvent.click(newButton);
    fireEvent.click(openButton);
    fireEvent.click(saveButton);
    expect(mockOpenStorageExplorer).toHaveBeenCalledTimes(3);
  });

  it('should set bot status', async () => {
    const mockSetBotStatus = jest.fn(() => null);
    const { getByText, rerender } = render(<Header setBotStatus={mockSetBotStatus} botStatus={'stopped'} />);

    const startButton = await waitForElement(() => getByText(/Start/));
    fireEvent.click(startButton);
    expect(mockSetBotStatus).toHaveBeenCalled();

    rerender(<Header setBotStatus={mockSetBotStatus} botStatus={'running'} />);
    const connectButton = await waitForElement(() => getByText('Connect and Test'));
    fireEvent.click(connectButton);
  });
});
