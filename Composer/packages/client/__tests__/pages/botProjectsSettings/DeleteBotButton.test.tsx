// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import React from 'react';
import { act, fireEvent } from '@botframework-composer/test-utils';

import { DeleteBotButton } from '../../../src/pages/botProject/DeleteBotButton';
import { renderWithRecoil } from '../../testUtils';

const state = {
  projectId: 'test',
};

describe('Delete Bot Button', () => {
  it('should render Delete Bot Button', () => {
    const { getByText } = renderWithRecoil(
      <DeleteBotButton projectId={state.projectId} scrollToSectionId="deleteBot" />
    );
    const deleteButton = getByText('Delete');
    act(() => {
      fireEvent.click(deleteButton);
    });
    expect(getByText('Delete Bot')).toBeInTheDocument();
  });
});
