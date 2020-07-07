// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent } from '@bfc/test-utils';

import { dialogs } from '../constants.json';
import { ProjectTree } from '../../src/components/ProjectTree/ProjectTree.tsx';
import { renderWithStore } from '../testUtils';

describe('<ProjectTree/>', () => {
  it('should render the projecttree', async () => {
    const { findByText } = renderWithStore(<ProjectTree dialogs={dialogs} />);

    await findByText('ToDoBot');
  });

  it('should handle project tree item click', async () => {
    const mockFileSelect = jest.fn(() => null);
    const { findByText } = renderWithStore(<ProjectTree dialogs={dialogs} onSelect={mockFileSelect} />);

    const node = await findByText('addtodo');
    fireEvent.click(node);
    expect(mockFileSelect).toHaveBeenCalledTimes(1);
  });
});
