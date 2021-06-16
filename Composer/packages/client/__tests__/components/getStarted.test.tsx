// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { fireEvent } from '@botframework-composer/test-utils';
import React from 'react';

import { DialogSetting } from '../../../types/lib';
import { GetStarted } from '../../src/components/GetStarted/GetStarted';
import { GetStartedLearn } from '../../src/components/GetStarted/GetStartedLearn';
import {
  currentProjectIdState,
  botProjectIdsState,
  dialogsSelectorFamily,
  schemasState,
  projectMetaDataState,
  botProjectFileState,
  projectReadmeState,
  settingsState,
} from '../../src/recoilModel';
import { SAMPLE_DIALOG } from '../mocks/sampleDialog';
import { renderWithRecoil } from '../testUtils';

const projectId = '12345.6789';
const dialogs = [SAMPLE_DIALOG];

const luisConfig = {
  name: '',
  authoringKey: '12345',
  authoringEndpoint: 'testAuthoringEndpoint',
  endpointKey: '12345',
  endpoint: 'testEndpoint',
  authoringRegion: 'westus',
  defaultLanguage: 'en-us',
  environment: 'composer',
};

const qnaConfig = { subscriptionKey: '12345', endpointKey: '12345', qnaRegion: 'westus' };

const linkToPackageManager = `/bot/${projectId}/plugin/package-manager/package-manager`;
const linkToConnections = `/bot/${projectId}/botProjectsSettings/#connections`;
const linkToPublish = `/bot/${projectId}/publish/all`;
const linkToLUISSettings = `/bot/${projectId}/botProjectsSettings/#luisKey`;
const linktoQNASettings = `/bot/${projectId}/botProjectsSettings/#qnaKey`;
const linkToLGEditor = `/bot/${projectId}/language-generation`;
const linkToLUEditor = `/bot/${projectId}/language-understanding`;
const linkToReadme = `/bot/${projectId}/botProjectsSettings`;

const mockNavigationTo = jest.fn();
jest.mock('../../src/utils/navigation', () => ({
  navigateTo: (...args) => mockNavigationTo(...args),
}));

const getMockSettingsState = (completePublishProf: boolean): DialogSetting => {
  const publishTargetConfig = completePublishProf ? '{}' : '{"hostname":""}';
  return {
    luis: luisConfig,
    qna: qnaConfig,
    defaultLanguage: 'en-us',
    languages: ['en-us'],
    luFeatures: {},
    runtime: {
      key: '',
      customRuntime: true,
      path: '',
      command: '',
    },
    importedLibraries: [],
    customFunctions: [],
    publishTargets: [{ name: 'target1', type: 'azurewebapp', configuration: publishTargetConfig }],
  };
};

const getStartedProps = {
  requiresLUIS: true,
  requiresQNA: true,
  showTeachingBubble: false,
  projectId: projectId,
  isOpen: true,
  onBotReady: jest.fn(),
  onDismiss: jest.fn(),
};

describe('<GetStartedLearn />', () => {
  function renderComponent() {
    return renderWithRecoil(<GetStartedLearn projectId="" onDismiss={jest.fn()} />);
  }

  it('should render the component', async () => {
    const component = renderComponent();
    expect(component.container).toHaveTextContent('Get started');
    expect(component.container).toHaveTextContent('Quick references');
  });
});

describe('<GetStarted />', () => {
  const applyBaseState = (set: any) => {
    set(currentProjectIdState, projectId);
    set(botProjectIdsState, [projectId]);
    set(dialogsSelectorFamily(projectId), dialogs);
    set(schemasState(projectId), { sdk: { content: {} } });
    set(projectMetaDataState(projectId), { isRootBot: true });
    set(botProjectFileState(projectId), { foo: 'bar' });
  };

  it('should render the component', async () => {
    const component = renderWithRecoil(<GetStarted {...getStartedProps} />, ({ set }) => {
      applyBaseState(set);
    });
    expect(component.container).toBeDefined();
  });

  it('should render lg and lu steps (unconditional required steps)', async () => {
    const component = renderWithRecoil(<GetStarted {...getStartedProps} />, ({ set }) => {
      applyBaseState(set);
    });
    const lgNode = await component.queryByText('Edit bot responses');
    expect(lgNode).toBeTruthy();
    const luNode = await component.queryByText('Edit user input and triggers');
    expect(luNode).toBeTruthy();
  });

  it('should render packages and insights steps (unconditional optional steps)', async () => {
    const component = renderWithRecoil(<GetStarted {...getStartedProps} />, ({ set }) => {
      applyBaseState(set);
    });
    const packagesNode = await component.queryByText('Add packages');
    expect(packagesNode).toBeTruthy();
    const appInsightsNode = await component.queryByText('Enable App Insights');
    expect(appInsightsNode).toBeTruthy();
  });

  it('should render readMe next step', async () => {
    const component = renderWithRecoil(<GetStarted {...getStartedProps} />, ({ set }) => {
      applyBaseState(set);
      set(projectReadmeState(projectId), '## test markdown');
    });
    const node = await component.findByText('Review your template readme');
    expect(node).toBeTruthy();
  });

  it('should not render readMe next step', async () => {
    const component = renderWithRecoil(<GetStarted {...getStartedProps} />, ({ set }) => {
      applyBaseState(set);
    });
    const node = await component.queryByText('Review your template readme');
    expect(node).toBeFalsy();
  });

  it('should render LUIS and QNA', async () => {
    const component = renderWithRecoil(<GetStarted {...getStartedProps} />, ({ set }) => {
      applyBaseState(set);
    });
    const luisNode = await component.queryByText('Set up Language Understanding');
    expect(luisNode).toBeTruthy();
    const qnaNode = await component.queryByText('Set up QnA Maker');
    expect(qnaNode).toBeTruthy();
  });

  it('should not render LUIS and QNA', async () => {
    const component = renderWithRecoil(
      <GetStarted {...getStartedProps} requiresLUIS={false} requiresQNA={false} />,
      ({ set }) => {
        applyBaseState(set);
      }
    );
    const luisNode = await component.queryByText('Set up Language Understanding');
    expect(luisNode).toBeNull();
    const qnaNode = await component.queryByText('Set up QnA Maker');
    expect(qnaNode).toBeNull();
  });

  it('should render lu and qna checked', async () => {
    const component = renderWithRecoil(<GetStarted {...getStartedProps} />, ({ set }) => {
      applyBaseState(set);
      set(settingsState(projectId), getMockSettingsState(true));
    });
    const checkedQna = await component.queryByTestId('qna-checked');
    expect(checkedQna).toBeTruthy();
    const checkedLuis = await component.queryByTestId('luis-checked');
    expect(checkedLuis).toBeTruthy();
  });

  it('should render lu and qna unchecked', async () => {
    const component = renderWithRecoil(<GetStarted {...getStartedProps} />, ({ set }) => {
      applyBaseState(set);
    });
    const unCheckedQna = await component.queryByTestId('qna-unChecked');

    expect(unCheckedQna).toBeTruthy();
    const unCheckedLuis = await component.queryByTestId('luis-unChecked');
    expect(unCheckedLuis).toBeTruthy();
  });

  it('should not render create publish profile step', async () => {
    const component = renderWithRecoil(<GetStarted {...getStartedProps} />, ({ set }) => {
      applyBaseState(set);
      set(settingsState(projectId), getMockSettingsState(true));
    });
    const createPublishNode = await component.queryByText('Create a publishing profile');

    expect(createPublishNode).toBeFalsy();
  });

  it('should render create publish profile step and not complete profile step', async () => {
    const component = renderWithRecoil(<GetStarted {...getStartedProps} />, ({ set }) => {
      applyBaseState(set);
    });
    const createPublishNode = await component.queryByText('Create a publishing profile');
    expect(createPublishNode).toBeTruthy();
    const completePublishNode = await component.queryByText('Complete your publishing profile');
    expect(completePublishNode).toBeFalsy();
  });
  it('should render complete profile step', async () => {
    const component = renderWithRecoil(<GetStarted {...getStartedProps} />, ({ set }) => {
      applyBaseState(set);
      set(settingsState(projectId), getMockSettingsState(false));
    });
    const createPublishNode = await component.queryByText('Complete your publishing profile');

    expect(createPublishNode).toBeTruthy();
  });

  it('should render publish step and add Connections step', async () => {
    const component = renderWithRecoil(<GetStarted {...getStartedProps} />, ({ set }) => {
      applyBaseState(set);
      set(settingsState(projectId), getMockSettingsState(true));
    });
    const createPublishNode = await component.queryByText('Publish your bot');
    expect(createPublishNode).toBeTruthy();
    const addConnectionsNode = await component.queryByText('Add connections');
    expect(addConnectionsNode).toBeTruthy();
  });

  it('Deep links should nave to correct page', async () => {
    const component = renderWithRecoil(<GetStarted {...getStartedProps} />, ({ set }) => {
      applyBaseState(set);
      set(settingsState(projectId), getMockSettingsState(true));
    });
    const createPublishNode = await component.queryByText('Publish your bot');
    expect(createPublishNode).toBeTruthy();
    const addConnectionsNode = await component.queryByText('Add connections');
    expect(addConnectionsNode).toBeTruthy();
  });

  it('should have working deep links', () => {
    const { getByTestId } = renderWithRecoil(<GetStarted {...getStartedProps} />, ({ set }) => {
      applyBaseState(set);
      set(settingsState(projectId), getMockSettingsState(true));
      set(projectReadmeState(projectId), '## test markdown');
    });
    fireEvent.click(getByTestId('readme-unChecked'));
    expect(mockNavigationTo).toHaveBeenCalledWith(linkToReadme);
    fireEvent.click(getByTestId('luis-checked'));
    expect(mockNavigationTo).nthCalledWith(2, linkToLUISSettings);
    fireEvent.click(getByTestId('qna-checked'));
    expect(mockNavigationTo).nthCalledWith(3, linktoQNASettings);
    fireEvent.click(getByTestId('editlg-unChecked'));
    expect(mockNavigationTo).nthCalledWith(4, linkToLGEditor);
    fireEvent.click(getByTestId('editlu-unChecked'));
    expect(mockNavigationTo).nthCalledWith(5, linkToLUEditor);
    fireEvent.click(getByTestId('publish-unChecked'));
    expect(mockNavigationTo).nthCalledWith(6, linkToPublish);
    fireEvent.click(getByTestId('connections-unChecked'));
    expect(mockNavigationTo).nthCalledWith(7, linkToConnections);
    fireEvent.click(getByTestId('packages-unChecked'));
    expect(mockNavigationTo).nthCalledWith(8, linkToPackageManager);
  });
});
