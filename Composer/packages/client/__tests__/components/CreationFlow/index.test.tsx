// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, fireEvent } from '@bfc/test-utils';
import { createHistory, createMemorySource, LocationProvider } from '@reach/router';

import { StoreContext } from '../../../src/store';
import CreationFlow from '../../../src/components/CreationFlow/index';
import { CreationFlowStatus } from '../../../src/constants';

jest.mock('../../../src/components/DialogWrapper', () => {
  return {
    DialogWrapper: jest.fn(props => {
      return props.children;
    }),
  };
});

describe('<CreationFlow/>', () => {
  let storeContext, saveTemplateMock, locationMock, createProjectMock;

  function renderComponent() {
    return render(
      <StoreContext.Provider value={storeContext}>
        <CreationFlow location={locationMock} />
      </StoreContext.Provider>
    );
  }

  function renderWithRouter(ui, { route = '', history = createHistory(createMemorySource(route)) } = {}) {
    return {
      ...render(<LocationProvider history={history}>{ui}</LocationProvider>),
      history,
    };
  }

  beforeEach(() => {
    saveTemplateMock = jest.fn();
    locationMock = {};
    storeContext = {
      actions: {
        saveTemplateId: saveTemplateMock,
        fetchTemplates: jest.fn(),
        openBotProject: jest.fn(),
        createProject: createProjectMock,
        saveProjectAs: jest.fn(),
        fetchStorages: jest.fn(),
        fetchFolderItemsByPath: jest.fn(),
        setCreationFlowStatus: jest.fn(),
        onboardingAddCoachMarkRef: jest.fn(),
        fetchRecentProjects: jest.fn(),
      },
      state: {
        templateId: '',
        templateProjects: [],
        recentProjects: [],
        storages: [],
        creationFlowStatus: CreationFlowStatus.NEW_FROM_TEMPLATE,
      },
    };
  });

  it('should render the component', async () => {
    const expectedTemplateId = 'EchoBot';
    storeContext.state.templateId = 'EchoBot';
    storeContext.actions.createProject = async templateId => {
      expect(templateId).toBe(expectedTemplateId);
    };
    storeContext.state.focusedStorageFolder = {
      name: 'Desktop',
      parent: '/test-folder',
      writable: true,
      children: [
        {
          name: 'EchoBot-0',
          type: 'bot',
          path: 'Desktop/EchoBot-11299',
          lastModified: 'Wed Apr 22 2020 17:51:07 GMT-0700 (Pacific Daylight Time)',
          size: '',
        },
      ],
    };
    const {
      history: { navigate },
    } = renderWithRouter(
      <StoreContext.Provider value={storeContext}>
        <CreationFlow location={locationMock} />
      </StoreContext.Provider>
    );

    const component = renderComponent();
    await navigate('/create/template/Echobot');
    const node = await component.findByText('Next');
    fireEvent.click(node);
  });
});
