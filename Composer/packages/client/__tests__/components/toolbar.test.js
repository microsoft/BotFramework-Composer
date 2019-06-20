import * as React from 'react';
import { fireEvent, render } from 'react-testing-library';

import { ToolBar } from '../../src/components/ToolBar';

describe('<ToolBar />', () => {
  it('should render the ToolBar', () => {
    const { container } = render(<ToolBar />);

    expect(container).toHaveTextContent('New');
    expect(container).toHaveTextContent('Open');
    expect(container).toHaveTextContent('Save as');
    expect(container).toHaveTextContent('Connect');
  });

  it('should open storage explorer', async () => {
    const mockOpenStorageExplorer = jest.fn(() => null);
    const { findByText } = render(<ToolBar openStorageExplorer={mockOpenStorageExplorer} />);
    const newButton = await findByText(/New/);
    const openButton = await findByText(/Open/);
    const saveButton = await findByText(/Save as/);
    fireEvent.click(newButton);
    fireEvent.click(openButton);
    fireEvent.click(saveButton);
    expect(mockOpenStorageExplorer).toHaveBeenCalledTimes(3);
  });

  it('should set bot status', async () => {
    const mockConnectBot = jest.fn(() => null);
    const { findByText } = render(<ToolBar connectBot={mockConnectBot} botStatus={'unConnected'} />);

    const connectButton = await findByText(/Connect/);
    fireEvent.click(connectButton);
    expect(mockConnectBot).toHaveBeenCalled();
  });
});
