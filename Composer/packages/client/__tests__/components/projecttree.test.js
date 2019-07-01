import * as React from 'react';
import { fireEvent, render } from 'react-testing-library';

import { dialogs } from '../constants.json';
import { ProjectTree } from '../../src/components/ProjectTree/index.js';

describe('<ProjectTree/>', () => {
  it('should render the projecttree', async () => {
    const { findByText } = render(<ProjectTree files={dialogs} />);

    await findByText('ToDoBot');
  });

  it('should handle project tree item click', async () => {
    const mockFileSelect = jest.fn(() => null);
    const { findByTitle } = render(<ProjectTree files={dialogs} onSelect={mockFileSelect} />);

    const node = await findByTitle('AddToDo');
    fireEvent.click(node);
    expect(mockFileSelect).toHaveBeenCalledTimes(1);
  });
});
