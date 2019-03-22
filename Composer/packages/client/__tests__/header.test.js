import * as React from 'react';
import { cleanup, fireEvent, render, waitForElement } from 'react-testing-library';

import { Header } from '../src/components/Header';

describe('<Header />', () => {
  afterEach(cleanup);

  it('should render the header', async () => {
    const { getByText } = render(<Header />);

    await waitForElement(() => getByText(/Composer/));
    await waitForElement(() => getByText(/New/));
    await waitForElement(() => getByText(/Open/));
  });

  it('should open a file', async () => {
    const mockFileOpen = jest.fn(() => null);
    const { getByText } = render(<Header onFileOpen={mockFileOpen} />);

    const openButton = await waitForElement(() => getByText(/Open/));
    const input = openButton.querySelector('input');
    fireEvent.change(input, { target: { files: ['file0', 'file1', 'file2'] } });
    expect(mockFileOpen).toHaveBeenCalledWith(['file0', 'file1', 'file2']);
  });

  it('should set bot status', async () => {
    const mockSetBotStatus = jest.fn(() => null);
    const { getByText } = render(<Header setBotStatus={mockSetBotStatus} botStatus={'notRunning'} />);

    const startButton = await waitForElement(() => getByText(/Start/));
    fireEvent.click(startButton);
    expect(mockSetBotStatus).toHaveBeenCalled();
  });
});
