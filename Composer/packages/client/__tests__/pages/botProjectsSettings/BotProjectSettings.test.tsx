// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { act, fireEvent } from '@botframework-composer/test-utils';

import { renderWithRecoilAndCustomDispatchers } from '../../testUtils';
import {
  botProjectFileState,
  botProjectIdsState,
  dialogsSelectorFamily,
  dispatcherState,
  locationState,
  projectMetaDataState,
  projectReadmeState,
  schemasState,
} from '../../../src/recoilModel';
import { currentProjectIdState } from '../../../src/recoilModel';
import { SAMPLE_DIALOG } from '../../mocks/sampleDialog';
import BotProjectSettings from '../../../src/pages/botProject/BotProjectSettings';

const projectId = '12345.6789';
const dialogs = [SAMPLE_DIALOG];
const mockLocation = 'foo/bar';
const mockReadMeContent = 'mock read me content';

const setSettingsMock = jest.fn();
const mockNavigationTo = jest.fn();

enum PivotItemKey {
  Basics = 'Basics',
  LuisQna = 'LuisQna',
  Connections = 'Connections',
  SkillConfig = 'SkillConfig',
  Language = 'Language',
}

jest.mock('../../../src/utils/navigation', () => ({
  navigateTo: (...args) => mockNavigationTo(...args),
  createBotSettingUrl: jest.fn(),
}));
const initRecoilState = ({ set }) => {
  set(currentProjectIdState, projectId);
  set(botProjectIdsState, [projectId]);
  set(dialogsSelectorFamily(projectId), dialogs);
  set(schemasState(projectId), { sdk: { content: {} } });
  set(projectMetaDataState(projectId), { isRootBot: true });
  set(botProjectFileState(projectId), { foo: 'bar' });
  set(locationState(projectId), mockLocation);
  set(projectReadmeState(projectId), mockReadMeContent);
  set(dispatcherState, {
    setSettings: setSettingsMock,
    setPageElementState: jest.fn(),
  });
};
describe('<BotProjectSettings />', () => {
  it('should toggle JSON view', async () => {
    const component = renderWithRecoilAndCustomDispatchers(
      <BotProjectSettings projectId={projectId} />,
      initRecoilState
    );
    const jsonToggleNode = await component.findByTestId('advancedSettingsToggle');
    await act(async () => {
      await fireEvent.click(jsonToggleNode);
    });
    const jsonEditorNode = await component.findByTestId('jsonEditor');
    expect(jsonEditorNode).toBeTruthy();

    await act(async () => {
      await fireEvent.click(jsonToggleNode);
    });

    const tabViewContainer = await component.findByTestId('settingsTabView');
    expect(tabViewContainer).toBeTruthy();
  });
});

describe('<BotProjectSettingsTabView />', () => {
  const getRouteString = (itemKey: string) => {
    return `/bot/${projectId}/botProjectsSettings/#${itemKey}`;
  };
  it('should nav to all tabs', async () => {
    const component = renderWithRecoilAndCustomDispatchers(
      <BotProjectSettings projectId={projectId} />,
      initRecoilState
    );
    const overviewTabNode = await component.findByText('Overview');
    await act(async () => {
      await fireEvent.click(overviewTabNode);
    });
    expect(mockNavigationTo).toHaveBeenCalledWith(getRouteString(PivotItemKey.Basics));

    const devResourcesTabNode = await component.findByText('Development resources');
    await act(async () => {
      await fireEvent.click(devResourcesTabNode);
    });
    expect(mockNavigationTo).toHaveBeenCalledWith(getRouteString(PivotItemKey.LuisQna));

    const connectionsTabNode = await component.findByText('Connections');
    await act(async () => {
      await fireEvent.click(connectionsTabNode);
    });
    expect(mockNavigationTo).toHaveBeenCalledWith(getRouteString(PivotItemKey.Connections));

    const skillsTabNode = await component.findByText('Skill configuration');
    await act(async () => {
      await fireEvent.click(skillsTabNode);
    });
    expect(mockNavigationTo).toHaveBeenCalledWith(getRouteString(PivotItemKey.SkillConfig));

    const localizationTabNode = await component.findByText('Localization');
    await act(async () => {
      await fireEvent.click(localizationTabNode);
    });
    expect(mockNavigationTo).toHaveBeenCalledWith(getRouteString(PivotItemKey.Language));
  });
});
