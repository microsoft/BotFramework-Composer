// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { renderWithRecoilAndCustomDispatchers } from '../../testUtils';
import { botProjectFileState, botProjectIdsState, projectMetaDataState } from '../../../src/recoilModel';
import { ExternalService } from '../../../src/pages/botProject/ExternalService';

const mockRootProjId = '123';
const mockSkillProjId = '456';

describe('<ExternalService />', () => {
  const initRecoilState = ({ set }) => {
    set(botProjectIdsState, [mockRootProjId, mockSkillProjId]);
    set(projectMetaDataState(mockRootProjId), { isRootBot: true });
    set(botProjectFileState(mockRootProjId), { foo: 'bar' });
    set(projectMetaDataState(mockSkillProjId), { isRootBot: false });
    set(botProjectFileState(mockSkillProjId), { foo: 'bar' });
  };

  it('should render root external service view', async () => {
    const component = renderWithRecoilAndCustomDispatchers(
      <ExternalService projectId={mockRootProjId} />,
      initRecoilState
    );
    const skillBotTextNode = await component.queryByTestId('skillQnaAuthoringBtn');
    expect(skillBotTextNode).toBeFalsy();
  });

  it('should render skill external service view', async () => {
    const component = renderWithRecoilAndCustomDispatchers(
      <ExternalService projectId={mockSkillProjId} />,
      initRecoilState
    );
    const skillBotTextNode = await component.queryByTestId('skillQnaAuthoringBtn');
    expect(skillBotTextNode).toBeTruthy();
  });
});
