// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent } from '@bfc/test-utils';

import { dialogs } from '../constants.json';
import { ProjectTree } from '../../src/components/ProjectTree/ProjectTree';
import { renderWithRecoil } from '../testUtils';

describe('<ProjectTree/>', () => {
  it('should render the projecttree', async () => {
    const { findByText } = renderWithRecoil(<ProjectTree dialogs={dialogs as any} />);

    await findByText('ToDoBot');
  });

  it('should handle project tree item click', async () => {
    const mockFileSelect = jest.fn(() => null);
    const { findByText } = renderWithRecoil(<ProjectTree dialogs={dialogs} onSelect={mockFileSelect} />);

    const node = await findByText('addtodo');
    fireEvent.click(node);
    expect(mockFileSelect).toHaveBeenCalledTimes(1);
  });
});
