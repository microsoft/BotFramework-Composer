// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { RecoilRoot } from 'recoil';
import { render } from '@botframework-composer/test-utils';

import { ImportModal } from '../../../src/components/ImportModal/ImportModal';
import { dispatcherState } from '../../../src/recoilModel';

describe('<ImportModal />', () => {
  let locationMock;
  const initRecoilState = ({ set }) => {
    set(dispatcherState, {
      addNotification: jest.fn(),
      createNotification: jest.fn(),
    });
  };

  it('should render the component', async () => {
    const { findByTestId } = render(
      <RecoilRoot initializeState={initRecoilState}>
        <ImportModal location={locationMock}></ImportModal>
      </RecoilRoot>
    );

    const connecting = await findByTestId('importModalConnecting');
    expect(connecting).not.toBeNull();
    expect(connecting).toHaveTextContent('Connecting to external service to import bot content...');
  });
});
