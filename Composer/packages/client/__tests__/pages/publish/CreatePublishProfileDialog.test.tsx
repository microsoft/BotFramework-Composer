// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { act, fireEvent, render } from '@botframework-composer/test-utils';

import { CreatePublishProfileDialog } from '../../../src/pages/botProject/CreatePublishProfileDialog';

describe('CreatePublishProfileDialog', () => {
  it("Call param function when 'Create new publish profile' is clicked", async () => {
    const onShowPublishProfileDialogMock = jest.fn();
    const component = render(
      <CreatePublishProfileDialog onShowPublishProfileWrapperDialog={onShowPublishProfileDialogMock} />
    );
    const createNewBtn = component.getByTestId('addNewPublishProfile');
    await act(async () => {
      await fireEvent.click(createNewBtn);
    });
    expect(onShowPublishProfileDialogMock).toBeCalled();
  });
});
