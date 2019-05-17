import * as React from 'react';
import { fireEvent, render, waitForElement } from 'react-testing-library';

import { dialogs } from '../constants.json';
import { ProjectTree } from '../../src/components/ProjectTree/index.js';

describe('<ProjectTree/>', () => {
  it('should render the projecttree', async () => {
    const { getByText } = render(<ProjectTree files={dialogs} />);

    await waitForElement(() => getByText('ToDoBot.main'));
  });

  it('should handle project tree item click', async () => {
    const mockFileSelect = jest.fn(() => null);
    const { getByText } = render(<ProjectTree files={dialogs} onSelect={mockFileSelect} />);

    const node = await waitForElement(() => getByText('ToDoBot.main'));
    fireEvent.click(node);
    expect(mockFileSelect).toHaveBeenCalled();
  });

  it('font blue when project item active', async () => {
    const { rerender, getByText } = render(<ProjectTree files={dialogs} activeNode={0} />);
    let node = getByText('ToDoBot.main');
    expect(node.parentNode).toHaveStyle('color: #0083cb;');

    rerender(<ProjectTree files={dialogs} activeNode={1} />);
    node = getByText('AddToDo');
    expect(node.parentNode).toHaveStyle('color: #0083cb;');
  });
});
