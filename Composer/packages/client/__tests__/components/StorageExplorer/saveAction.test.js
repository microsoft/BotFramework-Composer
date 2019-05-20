import * as React from 'react';
import { fireEvent, render, act } from 'react-testing-library';

import { SaveAction } from './../../../src/components/StorageExplorer/SaveAction/index';

describe('<SaveAction/>', () => {
  it('should render the file save item', () => {
    const { container } = render(<SaveAction />);

    expect(container).toHaveTextContent(/Save/);
  });

  it('should call error when save empty', async () => {
    const mockOnGetErrorMessage = jest.fn(() => 'error');
    const { getByText } = render(<SaveAction onGetErrorMessage={mockOnGetErrorMessage} />);
    const saveButton = getByText('Save');
    fireEvent.click(saveButton);
    expect(mockOnGetErrorMessage).toHaveBeenCalledTimes(1);
  });
});
