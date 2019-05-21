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

  it('should open storage explorer', () => {
    const mockOpenStorageExplorer = jest.fn(() => null);
    const { getByText } = render(<Header openStorageExplorer={mockOpenStorageExplorer} />);
    fireEvent.click(getByText(/New/));
    fireEvent.click(getByText(/Open/));
    fireEvent.click(getByText(/Save as/));
    expect(mockOpenStorageExplorer).toHaveBeenCalledTimes(3);
  });

  it('should set bot status', () => {
    const mockSetBotStatus = jest.fn(() => null);
    const { getByText, rerender } = render(<Header setBotStatus={mockSetBotStatus} botStatus={'stopped'} />);

    const startButton = getByText(/Start/);
    fireEvent.click(startButton);
    expect(mockSetBotStatus).toHaveBeenCalled();

    rerender(<Header setBotStatus={mockSetBotStatus} botStatus={'running'} />);
    const connectButton = getByText('Connect and Test');
    fireEvent.click(connectButton);
  });
});
