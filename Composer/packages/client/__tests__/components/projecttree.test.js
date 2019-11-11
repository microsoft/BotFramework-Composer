// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent } from 'react-testing-library';

import { dialogs } from '../constants.json';
import { ProjectTree } from '../../src/components/ProjectTree/index.tsx';
import { renderWithStore } from '../testUtils';

describe('<ProjectTree/>', () => {
  it('should render the projecttree', async () => {
    const { findByText } = renderWithStore(<ProjectTree dialogs={dialogs} />);

    await findByText('ToDoBot.Main');
  });

  it('should handle project tree item click', async () => {
    const mockFileSelect = jest.fn(() => null);
    const { findByText } = renderWithStore(<ProjectTree dialogs={dialogs} onSelect={mockFileSelect} />);

    const node = await findByText('AddToDo');
    fireEvent.click(node);
    expect(mockFileSelect).toHaveBeenCalledTimes(1);
  });
});
