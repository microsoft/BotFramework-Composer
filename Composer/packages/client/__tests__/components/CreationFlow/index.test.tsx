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
  templateProjectsState,
} from '../../../src/recoilModel';
import { CreationFlowStatus } from '../../../src/constants';
import CreationFlow from '../../../src/components/CreationFlow/CreationFlow';

describe('<CreationFlow/>', () => {
  let locationMock;
  const createProjectMock = jest.fn();
  const initRecoilState = ({ set }) => {
    set(dispatcherState, {
      createNewBot: createProjectMock,
      fetchStorages: jest.fn(),
      fetchTemplateProjects: jest.fn(),
      onboardingAddCoachMarkRef: jest.fn(),
      fetchRecentProjects: jest.fn(),
      fetchFeed: jest.fn(),
      fetchTemplates: jest.fn(),
      setCreationFlowStatus: jest.fn(),
      navTo: jest.fn(),
      saveTemplateId: jest.fn(),
      setCurrentPageMode: jest.fn(),
    });
    set(creationFlowStatusState, CreationFlowStatus.NEW_FROM_TEMPLATE);
    set(featureFlagsState, getDefaultFeatureFlags());
    set(templateProjectsState, [
      {
        id: '@microsoft/generator-bot-empty',
        name: 'Empty Bot',
        description: 'Yeoman generator for creating an empty bot built on the Azure Bot Framework.',
        package: { packageName: '@microsoft/generator-bot-empty', packageSource: 'npm', packageVersion: '1.0.0' },
        dotnetSupport: { functionsSupported: true, webAppSupported: true },
        nodeSupport: { functionsSupported: true, webAppSupported: true },
      },
    ]);

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

    navigate('create/dotnet/%40microsoft%2Fgenerator-bot-empty');
    const node = await findByText('Create');

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
      name: 'Empty',
      schemaUrl: '',
      templateId: '@microsoft/generator-bot-empty',
      templateVersion: '1.0.0',
      alias: undefined,
      eTag: undefined,
      preserveRoot: undefined,
      qnqKbUrls: undefined,
      runtimeType: 'webapp',
      templateDir: undefined,
      urlSuffix: undefined,
      profile: undefined,
      qnaKbUrls: undefined,
      runtimeLanguage: 'dotnet',
      source: undefined,
      isLocalGenerator: false,
    });
  });
});
