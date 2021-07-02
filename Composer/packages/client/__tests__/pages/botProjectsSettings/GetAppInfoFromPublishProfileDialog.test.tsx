// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { fireEvent, screen } from '@botframework-composer/test-utils';

import { renderWithRecoilAndCustomDispatchers } from '../../testUtils';
import { dispatcherState } from '../../../src/recoilModel';
import { settingsState, currentProjectIdState } from '../../../src/recoilModel';
import { GetAppInfoFromPublishProfileDialog } from '../../../src/pages/botProject/GetAppInfoFromPublishProfileDialog';
import { PublishTarget } from '../../../../types/lib';

const projectId = '123';
const publishTargetConfig = { settings: { MicrosoftAppId: 'mockAppId', MicrosoftAppPassword: 'mockPass' } };
const mockProfileName = 'target1';
const getMockSettings = (mockPublishTargets: boolean) => {
  const result = {
    defaultLanguage: 'en-us',
    languages: ['en-us', 'fr-fr'],
    publishTargets: [] as PublishTarget[],
  };
  if (mockPublishTargets) {
    result.publishTargets.push({
      name: mockProfileName,
      type: 'azurewebapp',
      configuration: JSON.stringify(publishTargetConfig),
    });
  }
  return result;
};

describe('<GetAppInfoFromPublishProfile />', () => {
  it('should render error message if there are no publish profiles', async () => {
    const setSettingsMock = jest.fn();
    const onOkayMock = jest.fn();
    const onCancelMock = jest.fn();
    const initRecoilState = ({ set }) => {
      set(currentProjectIdState, projectId);
      set(settingsState(projectId), getMockSettings(false));
      set(dispatcherState, {
        setSettings: setSettingsMock,
      });
    };
    const component = renderWithRecoilAndCustomDispatchers(
      <GetAppInfoFromPublishProfileDialog
        hidden={false}
        projectId={projectId}
        onCancel={onCancelMock}
        onOK={onOkayMock}
      />,
      initRecoilState
    );
    const errorNode = await component.findByText('No profiles were found containing a Microsoft App ID.');
    expect(errorNode).toBeTruthy();
  });

  it('should render available publish profiles', async () => {
    const setSettingsMock = jest.fn();
    const onOkayMock = jest.fn();
    const onCancelMock = jest.fn();
    const initRecoilState = ({ set }) => {
      set(currentProjectIdState, projectId);
      set(settingsState(projectId), getMockSettings(true));
      set(dispatcherState, {
        setSettings: setSettingsMock,
      });
    };
    const component = renderWithRecoilAndCustomDispatchers(
      <GetAppInfoFromPublishProfileDialog
        hidden={false}
        projectId={projectId}
        onCancel={onCancelMock}
        onOK={onOkayMock}
      />,
      initRecoilState
    );
    const dropdown = component.getByTestId('publishProfileDropdown');
    fireEvent.click(dropdown);
    const options = screen.getAllByRole('option').slice(1);
    expect(options[0]).toHaveTextContent(mockProfileName);
  });
});
