// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import React from 'react';
import { act, fireEvent } from '@botframework-composer/test-utils';

import { PublishTargets } from '../../../src/pages/botProject/PublishTargets';
import { renderWithRecoilAndCustomDispatchers } from '../../testUtils';
import { dispatcherState, publishTypesState } from '../../../src/recoilModel';
import { isShowAuthDialog } from '../../../src/utils/auth';

jest.mock('../../../src/utils/auth', () => ({
  isShowAuthDialog: jest.fn(),
  getTokenFromCache: jest.fn(),
  isGetTokenFromUser: jest.fn(),
}));

const state = {
  projectId: 'test',
  publishTypes: [{ name: 'azureFunctionsPublish', description: 'Publish bot to Azure Functions (Preview)' }],
};

describe('Publish Target', () => {
  beforeEach(() => {
    (isShowAuthDialog as jest.Mock).mockReturnValue(false);
  });
  const setPublishTargetsMock = jest.fn();
  const initRecoilState = ({ set }) => {
    set(dispatcherState, {
      setPublishTargets: setPublishTargetsMock,
      getPublishTargetTypes: () => {},
    });
    set(publishTypesState(state.projectId), [
      { name: 'azureFunctionsPublish', description: 'Publish bot to Azure Functions (Preview)' },
    ]);
  };
  it('should add new publish profile', () => {
    const { getByTestId, getByText } = renderWithRecoilAndCustomDispatchers(
      <PublishTargets projectId={state.projectId} />,
      initRecoilState
    );

    const addNewPublishProfile = getByTestId('addNewPublishProfile');
    act(() => {
      fireEvent.click(addNewPublishProfile);
    });
    expect(getByText('Add a publishing profile')).toBeInTheDocument();
  });
});
