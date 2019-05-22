import * as React from 'react';
import { fireEvent, render, cleanup } from 'react-testing-library';
import { SharedColors } from '@uifabric/fluent-theme';

import { dialogs } from '../constants.json';
import { ProjectTree } from '../../src/components/ProjectTree/index.js';

describe('<ProjectTree/>', () => {
  afterEach(cleanup);
  it('should render the projecttree', async () => {
    const { findByText } = render(<ProjectTree files={dialogs} />);

    await findByText('ToDoBot.main');
  });

  it('should handle project tree item click', async () => {
    const mockFileSelect = jest.fn(() => null);
    const { findByText } = render(<ProjectTree files={dialogs} onSelect={mockFileSelect} />);

    const node = await findByText('ToDoBot.main');
    fireEvent.click(node);
    expect(mockFileSelect).toHaveBeenCalledTimes(1);
  });

  it('font blue when project item active', async () => {
    const { rerender, findByText } = render(<ProjectTree files={dialogs} activeNode={0} />);
    let node = await findByText('ToDoBot.main');
    expect(node.parentNode).toHaveStyle(`color: ${SharedColors.cyanBlue10};`);

    rerender(<ProjectTree files={dialogs} activeNode={1} />);
    node = await findByText('AddToDo');
    expect(node.parentNode).toHaveStyle(`color: ${SharedColors.cyanBlue10};`);
  });
});
