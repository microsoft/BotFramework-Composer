// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, fireEvent, act } from '@bfc/test-utils';
import { createHistory, createMemorySource, LocationProvider } from '@reach/router';
import { RecoilRoot } from 'recoil';

import CreationFlow from '../../../src/components/CreationFlow/CreationFlow';
import { focusedStorageFolderState, creationFlowStatusState, dispatcherState } from '../../../src/recoilModel';
import { CreationFlowStatus } from '../../../src/constants';

describe('<CreationFlow/>', () => {
  let locationMock;
  const createProjectMock = jest.fn();
  const initRecoilState = ({ set }) => {
    set(dispatcherState, {
      createProject: createProjectMock,
      fetchStorages: jest.fn(),
      fetchTemplateProjects: jest.fn(),
      onboardingAddCoachMarkRef: jest.fn(),
      fetchRecentProjects: jest.fn(),
      fetchTemplates: jest.fn(),
      setCreationFlowStatus: jest.fn(),
      navTo: jest.fn(),
      saveTemplateId: jest.fn(),
    });
    set(creationFlowStatusState, CreationFlowStatus.NEW_FROM_TEMPLATE);

    set(focusedStorageFolderState, {
      name: 'Desktop',
      parent: '/test-folder',
      writable: true,
      children: [
        {
          name: 'EchoBot-0',
          type: 'bot',
          path: 'Desktop/EchoBot-11299',
          lastModified: 'Wed Apr 22 2020 17:51:07 GMT-0700 (Pacific Daylight Time)',
          size: 1,
        },
      ],
    });
  };

  function renderWithRouter(ui, { route = '', history = createHistory(createMemorySource(route)) } = {}) {
    return {
      ...render(<LocationProvider history={history}>{ui}</LocationProvider>),
      history,
    };
  }

  beforeEach(() => {
    createProjectMock.mockReset();
  });

  it('should render the component', async () => {
    const {
      findByText,
      history: { navigate },
    } = renderWithRouter(
      <RecoilRoot initializeState={initRecoilState}>
        <CreationFlow location={locationMock} />
      </RecoilRoot>
    );

    navigate('create/EchoBot');
    const node = await findByText('OK');

    act(() => {
      fireEvent.click(node);
    });
    expect(createProjectMock).toHaveBeenCalledWith(
      'EchoBot',
      'EchoBot-1',
      '',
      expect.stringMatching(/(\/|\\)test-folder(\/|\\)Desktop/),
      ''
    );
  });
});
