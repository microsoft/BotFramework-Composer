import * as React from 'react';
import { fireEvent, render } from 'react-testing-library';

import { ToolBar } from '../../src/components/ToolBar';

const toolbarItems = onClick => [
  {
    type: 'action',
    text: 'New',
    iconName: 'CirclePlus',
    onClick: onClick,
    align: 'left',
  },
  {
    type: 'action',
    text: 'Open',
    iconName: 'OpenFolderHorizontal',
    onClick: onClick,
    align: 'left',
  },
  {
    type: 'action',
    text: 'Save as',
    iconName: 'Save',
    onClick: onClick,
    align: 'left',
  },
  {
    type: 'element',
    element: <div>Connect</div>,
    align: 'right',
  },
];

describe('<ToolBar />', () => {
  it('should render the ToolBar', () => {
    const { container } = render(<ToolBar toolbarItems={toolbarItems(() => {})} />);

    expect(container).toHaveTextContent('New');
    expect(container).toHaveTextContent('Open');
    expect(container).toHaveTextContent('Save as');
    expect(container).toHaveTextContent('Connect');
  });

  it('should have item click event', async () => {
    const mockOpenStorageExplorer = jest.fn(() => null);
    const { findByText } = render(<ToolBar toolbarItems={toolbarItems(mockOpenStorageExplorer)} />);
    const newButton = await findByText(/New/);
    const openButton = await findByText(/Open/);
    const saveButton = await findByText(/Save as/);
    fireEvent.click(newButton);
    fireEvent.click(openButton);
    fireEvent.click(saveButton);
    expect(mockOpenStorageExplorer).toHaveBeenCalledTimes(3);
  });
});
