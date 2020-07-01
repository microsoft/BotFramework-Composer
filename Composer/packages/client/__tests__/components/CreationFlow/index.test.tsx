// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, fireEvent, act } from '@bfc/test-utils';
import { createHistory, createMemorySource, LocationProvider } from '@reach/router';
import { RecoilRoot } from 'recoil';

import CreationFlow from '../../../src/components/CreationFlow/CreationFlow';
import {
  focusedStorageFolderState,
  creationFlowStatusState,
  templateIdState,
  dispatcherState,
} from '../../../src/recoilModel';
import { CreationFlowStatus } from '../../../src/constants';
import { Dispatcher } from '../../../src/recoilModel/dispatchers';

jest.mock('../../../src/components/DialogWrapper/DialogWrapper', () => {
  return {
    DialogWrapper: jest.fn((props) => {
      return props.children;
    }),
  };
});

describe('<CreationFlow/>', () => {
  let locationMock;
  const createProjectMock = jest.fn();
  const initRecoilState = ({ set }) => {
    set(dispatcherState, (currentDispatcher: Dispatcher) => {
      return {
        ...currentDispatcher,
        createProject: createProjectMock,
        fetchStorages: jest.fn(),
        fetchTemplateProjects: jest.fn(),
      };
    });
    set(creationFlowStatusState, CreationFlowStatus.NEW_FROM_TEMPLATE);
    set(templateIdState, 'EchoBot');
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

  function renderComponent() {
    return (
      <RecoilRoot initializeState={initRecoilState}>
        <CreationFlow location={locationMock} />
      </RecoilRoot>
    );
  }

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
    const expectedTemplateId = 'EchoBot';

    const {
      history: { navigate },
    } = renderWithRouter(
      <RecoilRoot initializeState={initRecoilState}>
        <CreationFlow location={locationMock} />
      </RecoilRoot>
    );

    const component = renderComponent();
    navigate('create/Emptybot');
    const node = await component.findByText('OK');

    act(() => {
      fireEvent.click(node);
    });
    expect(createProjectMock).toHaveBeenCalledWith(expectedTemplateId, '', '', '');
  });
});
