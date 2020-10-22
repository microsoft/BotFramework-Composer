// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent } from '@botframework-composer/test-utils';

import { ProjectTree } from '../../src/components/ProjectTree/ProjectTree';
import { renderWithRecoil } from '../testUtils';
import { SAMPLE_DIALOG } from '../mocks/sampleDialog';
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
    const component = renderWithRecoil(
      <ProjectTree onDeleteDialog={() => {}} onDeleteTrigger={() => {}} onSelect={mockFileSelect} />,
      initRecoilState
    );

    const node = await component.findByTestId('EchoBot-1_Greeting');
    fireEvent.click(node);
    expect(mockFileSelect).toHaveBeenCalledTimes(1);
  });

  it('fires the onSelectAll event', async () => {
    const mockOnSelected = jest.fn();
    const { findByText } = renderWithRecoil(
      <ProjectTree
        onDeleteDialog={() => {}}
        onDeleteTrigger={() => {}}
        onSelect={() => {}}
        onSelectAllLink={mockOnSelected}
      />,
      initRecoilState
    );

    const node = await findByText('All');
    fireEvent.click(node);
    expect(mockOnSelected).toHaveBeenCalledTimes(1);
  });
});
