// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent, render } from 'react-testing-library';

import { ToolBar } from '../../src/components/ToolBar';

const toolbarItems = onClick => [
  {
    type: 'action',
    text: 'New',
    buttonProps: {
      iconProps: {
        iconName: 'Add',
      },
      onClick: onClick,
    },
    align: 'left',
  },
  {
    type: 'action',
    text: 'Open',
    buttonProps: {
      iconProps: {
        iconName: 'OpenFolderHorizontal',
      },
      onClick: onClick,
    },
    align: 'left',
  },
  {
    type: 'action',
    text: 'Save as',
    buttonProps: {
      iconProps: {
        iconName: 'Save',
      },
      onClick: onClick,
    },
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
    const mockSetCreationFlowStatus = jest.fn(() => null);
    const { findByText } = render(<ToolBar toolbarItems={toolbarItems(mockSetCreationFlowStatus)} />);
    const newButton = await findByText(/New/);
    const openButton = await findByText(/Open/);
    const saveButton = await findByText(/Save as/);
    fireEvent.click(newButton);
    fireEvent.click(openButton);
    fireEvent.click(saveButton);
    expect(mockSetCreationFlowStatus).toHaveBeenCalledTimes(3);
  });
});
