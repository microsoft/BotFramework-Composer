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
import BotProjectInfo from '../../../src/pages/botProject/BotProjectInfo';

const projectId = '12345.6789';
const dialogs = [SAMPLE_DIALOG];
const mockLocation = 'foo/bar';
const mockReadMeContent = 'mock read me content';

const setSettingsMock = jest.fn();

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
  });
};

describe('<BotProjectInfo />', () => {
  it('should render correct bot location', async () => {
    const component = renderWithRecoilAndCustomDispatchers(
      <BotProjectInfo isRootBot projectId={projectId} />,
      initRecoilState
    );
    const locationNode = await component.findByTestId('botLocationString');
    expect(locationNode.textContent).toBe(mockLocation);
  });

  it('should open read me', async () => {
    const component = renderWithRecoilAndCustomDispatchers(
      <BotProjectInfo isRootBot projectId={projectId} />,
      initRecoilState
    );

    // Create new caller
    const readMeBtn = component.getByTestId('settingsReadMeBtn');
    await act(async () => {
      await fireEvent.click(readMeBtn);
    });
    expect(component.findByText(mockReadMeContent)).toBeTruthy();
  });
});
