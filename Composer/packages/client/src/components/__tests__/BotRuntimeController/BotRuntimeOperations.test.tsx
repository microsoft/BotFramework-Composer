// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { renderWithRecoil } from '../../../../__tests__/testUtils/renderWithRecoil';
import { botStatusState } from '../../../recoilModel';
import { BotRuntimeOperations } from '../../BotRuntimeController/BotRuntimeOperations';
import { BotStatus } from '../../../constants';

describe('<BotRuntimeOperations.test />', () => {
  const projectId = '123a.324';
  it('should render the BotRuntimeOperations with failed status', () => {
    const { container } = renderWithRecoil(<BotRuntimeOperations isRoot projectId={projectId} />, ({ set }) => {
      set(botStatusState(projectId), BotStatus.failed);
    });
    expect(container.innerHTML.includes('Play')).toBeTruthy();
  });

  it('should render the BotRuntimeOperations with connected status', () => {
    const { container } = renderWithRecoil(<BotRuntimeOperations isRoot projectId={projectId} />, ({ set }) => {
      set(botStatusState(projectId), BotStatus.connected);
    });
    expect(container.innerHTML.includes('CircleStopSolid')).toBeTruthy();
  });

  it('should render the BotRuntimeOperations with unconnected status', () => {
    const { container } = renderWithRecoil(<BotRuntimeOperations isRoot projectId={projectId} />, ({ set }) => {
      set(botStatusState(projectId), BotStatus.inactive);
    });
    expect(container.innerHTML.includes('Play')).toBeTruthy();
  });

  it('should render the spinner for any other bot status', () => {
    const { container } = renderWithRecoil(<BotRuntimeOperations isRoot projectId={projectId} />, ({ set }) => {
      set(botStatusState(projectId), BotStatus.publishing);
    });
    expect(container.innerHTML.includes('Spinner')).toBeTruthy();
  });
});
