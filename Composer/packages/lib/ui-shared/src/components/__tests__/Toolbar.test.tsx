// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, fireEvent } from '@botframework-composer/test-utils';

import { Toolbar } from '../Toolbar';

const toolbarItems = (onClick) => [
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

describe('<Toolbar />', () => {
  it('should render the Toolbar', () => {
    const { container } = render(<Toolbar toolbarItems={toolbarItems(() => {})} />);

    expect(container).toHaveTextContent('New');
    expect(container).toHaveTextContent('Open');
    expect(container).toHaveTextContent('Save as');
    expect(container).toHaveTextContent('Connect');
  });

  it('should have item click event', async () => {
    const mockSetCreationFlowStatus = jest.fn(() => null);
    const { findByText } = render(<Toolbar toolbarItems={toolbarItems(mockSetCreationFlowStatus)} />);
    const newButton = await findByText(/New/);
    const openButton = await findByText(/Open/);
    const saveButton = await findByText(/Save as/);
    fireEvent.click(newButton);
    fireEvent.click(openButton);
    fireEvent.click(saveButton);
    expect(mockSetCreationFlowStatus).toHaveBeenCalledTimes(3);
  });
});
