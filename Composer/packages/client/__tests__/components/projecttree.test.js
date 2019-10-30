// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent, render } from 'react-testing-library';

import { dialogs } from '../constants.json';
import { ProjectTree } from '../../src/components/ProjectTree/index.tsx';
import { StoreProvider } from '../../src/store';

describe('<ProjectTree/>', () => {
  it('should render the projecttree', async () => {
    const { findByText } = render(
      <StoreProvider>
        <ProjectTree dialogs={dialogs} />
      </StoreProvider>
    );

    await findByText('ToDoBot.Main');
  });

  it('should handle project tree item click', async () => {
    const mockFileSelect = jest.fn(() => null);
    const { findByText } = render(
      <StoreProvider>
        <ProjectTree dialogs={dialogs} onSelect={mockFileSelect} />
      </StoreProvider>
    );

    const node = await findByText('AddToDo');
    fireEvent.click(node);
    expect(mockFileSelect).toHaveBeenCalledTimes(1);
  });
});
