import * as React from 'react';
import { fireEvent, render, waitForElement } from 'react-testing-library';

import { Header } from '../src/components/Header';

describe('<Header />', () => {
  it('should render the header', async () => {
    const { getByText } = render(<Header />);

    await waitForElement(() => getByText(/Bot Framework Designer/));
    await waitForElement(() => getByText(/New/));
    await waitForElement(() => getByText(/Open/));
  });

  it('should open storage explorer', async () => {
    const mockOpenStorageExplorer = jest.fn(() => null);
    const { getByText } = render(<Header openStorageExplorer={mockOpenStorageExplorer} />);
    const openButton = await waitForElement(() => getByText(/Open/));
    fireEvent.click(openButton);
    expect(mockOpenStorageExplorer).toHaveBeenCalled();
  });

  it('should set bot status', async () => {
    const mockSetBotStatus = jest.fn(() => null);
    const { getByText } = render(<Header setBotStatus={mockSetBotStatus} botStatus={'notRunning'} />);

    const startButton = await waitForElement(() => getByText(/Start/));
    fireEvent.click(startButton);
    expect(mockSetBotStatus).toHaveBeenCalled();
  });
});
