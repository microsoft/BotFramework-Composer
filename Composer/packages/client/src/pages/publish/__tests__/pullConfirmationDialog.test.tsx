// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { fireEvent, render } from '@botframework-composer/test-utils';

import { PullConfirmationDialog } from '../pullConfirmationDialog';

describe('<PullConfirmationDialog />', () => {
  it('should render', async () => {
    const { findByText } = render(<PullConfirmationDialog onConfirm={jest.fn()} onDismiss={jest.fn()} />);
    await findByText(
      'You are about to pull project files from the selected publish profiles. The current project will be overwritten by the pulled files, and will be saved as a backup automatically. You will be able to retrieve the backup anytime in the future.'
    );
  });

  it('should call onConfirm()', () => {
    const onConfirm = jest.fn();
    const { getByTestId } = render(<PullConfirmationDialog onConfirm={onConfirm} onDismiss={jest.fn()} />);
    fireEvent.click(getByTestId('pull-confirm-button'));

    expect(onConfirm).toHaveBeenCalled();
  });

  it('should call onDismiss()', () => {
    const onDismiss = jest.fn();
    const { getByTestId } = render(<PullConfirmationDialog onConfirm={jest.fn()} onDismiss={onDismiss} />);
    fireEvent.click(getByTestId('pull-cancel-button'));

    expect(onDismiss).toHaveBeenCalled();
  });
});
