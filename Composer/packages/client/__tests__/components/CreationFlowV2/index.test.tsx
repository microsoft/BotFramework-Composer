// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, fireEvent, act } from '@botframework-composer/test-utils';
import { createHistory, createMemorySource, LocationProvider } from '@reach/router';
import { RecoilRoot } from 'recoil';
import { getDefaultFeatureFlags } from '@bfc/shared';

import {
  focusedStorageFolderState,
  creationFlowStatusState,
  dispatcherState,
  featureFlagsState,
} from '../../../src/recoilModel';
import { CreationFlowStatus } from '../../../src/constants';
import CreationFlowV2 from '../../../src/components/CreationFlow/v2/CreationFlow';

describe('<CreationFlowV2/>', () => {
  let locationMock;
  const createProjectMock = jest.fn();
  const initRecoilState = ({ set }) => {
    set(dispatcherState, {
      createNewBotV2: createProjectMock,
      fetchStorages: jest.fn(),
      fetchTemplateProjects: jest.fn(),
      onboardingAddCoachMarkRef: jest.fn(),
      fetchRecentProjects: jest.fn(),
      fetchTemplates: jest.fn(),
      setCreationFlowStatus: jest.fn(),
      navTo: jest.fn(),
      saveTemplateId: jest.fn(),
      setCurrentPageMode: jest.fn(),
    });
    set(creationFlowStatusState, CreationFlowStatus.NEW_FROM_TEMPLATE);
    set(featureFlagsState, getDefaultFeatureFlags());
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
        <CreationFlowV2 location={locationMock} />
      </RecoilRoot>
    );

    navigate('create/generator-conversational-core');
    const node = await findByText('OK');

    act(() => {
      fireEvent.click(node);
    });

    let expectedLocation = '/test-folder/Desktop';
    if (process.platform === 'win32') {
      expectedLocation = '\\test-folder\\Desktop';
    }
    expect(createProjectMock).toHaveBeenCalledWith({
      appLocale: 'en-US',
      description: '',
      location: expectedLocation,
      name: 'conversational_core',
      schemaUrl: '',
      templateId: 'generator-conversational-core',
      templateVersion: '',
      alias: undefined,
      eTag: undefined,
      preserveRoot: undefined,
      qnqKbUrls: undefined,
      templateDir: undefined,
      urlSuffix: undefined,
    });
  });
});
