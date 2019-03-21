import * as React from 'react';
import { cleanup, fireEvent, render, waitForElement } from 'react-testing-library';

import { ProjectExplorer } from '../src/components/ProjectExplorer';

describe('<ProjectExplorer />', () => {
  afterEach(cleanup);

  it('should render the project explorer', async () => {
    const files = [{ name: 'file0' }, { name: 'file1' }, { name: 'file2' }];
    const { getByText } = render(<ProjectExplorer files={files} />);

    await waitForElement(() => getByText(/file0/));
    await waitForElement(() => getByText(/file1/));
    await waitForElement(() => getByText(/file2/));
  });

  it('should click an item', async () => {
    const mockOnClick = jest.fn(() => null);
    const files = [{ name: 'file0' }, { name: 'file1' }, { name: 'file2' }];
    const { getByText } = render(<ProjectExplorer files={files} onClick={mockOnClick} />);
    fireEvent.click(getByText(/file1/));

    expect(mockOnClick).toHaveBeenCalledWith({ name: 'file1' }, 1);
  });
});
