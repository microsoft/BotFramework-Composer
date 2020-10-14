// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent } from '@bfc/test-utils';

import { ProjectTree } from '../../src/components/ProjectTree/ProjectTree';
import { renderWithRecoil, SAMPLE_DIALOG } from '../testUtils';
import { dialogsState, currentProjectIdState, botProjectIdsState, schemasState } from '../../src/recoilModel';

const projectId = '12345.6789';
const dialogs = [SAMPLE_DIALOG];

const initRecoilState = ({ set }) => {
  set(currentProjectIdState, projectId);
  set(botProjectIdsState, [projectId]);
  set(dialogsState(projectId), dialogs);
  set(schemasState(projectId), { sdk: { content: {} } });
};

describe('<ProjectTree/>', () => {
  it('should render the projecttree', async () => {
    const { findByText } = renderWithRecoil(
      <ProjectTree onDeleteDialog={() => {}} onDeleteTrigger={() => {}} onSelect={() => {}} />,
      initRecoilState
    );

    await findByText('EchoBot-1');
  });

  it('should handle project tree item click', async () => {
    const mockFileSelect = jest.fn(() => null);
    const { findByText, debug } = renderWithRecoil(
      <ProjectTree onDeleteDialog={() => {}} onDeleteTrigger={() => {}} onSelect={mockFileSelect} />,
      initRecoilState
    );

    debug();

    const node = await findByText('Unknown intent');
    fireEvent.click(node);
    expect(mockFileSelect).toHaveBeenCalledTimes(1);
  });
});
