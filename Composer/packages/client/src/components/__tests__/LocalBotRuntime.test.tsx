// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { renderWithRecoil } from '../../../__tests__/testUtils/renderWithRecoil';
import { botStatusState } from '../../recoilModel';
import { LocalBotRuntime } from '../TestController/LocalBotRuntime';
import { BotStatus } from '../../constants';

describe('<LocalBotRuntime />', () => {
  const projectId = '123a.324';
  it('should render the Local Bot Runtime with failed status', () => {
    const { container } = renderWithRecoil(
      <LocalBotRuntime displayName="googleKeepSync" projectId={projectId} />,
      ({ set }) => {
        set(botStatusState(projectId), BotStatus.failed);
      }
    );
    expect(container.innerHTML.includes('Play')).toBeTruthy();
  });

  it('should render the Local Bot Runtime with connected status', () => {
    const { container } = renderWithRecoil(
      <LocalBotRuntime displayName="googleKeepSync" projectId={projectId} />,
      ({ set }) => {
        set(botStatusState(projectId), BotStatus.connected);
      }
    );
    expect(container.innerHTML.includes('CircleStopSolid')).toBeTruthy();
  });

  it('should render the Local Bot Runtime with unconnected status', () => {
    const { container } = renderWithRecoil(
      <LocalBotRuntime displayName="googleKeepSync" projectId={projectId} />,
      ({ set }) => {
        set(botStatusState(projectId), BotStatus.unConnected);
      }
    );
    expect(container.innerHTML.includes('Play')).toBeTruthy();
  });

  it('should render the spinner for any other bot status', () => {
    const { container } = renderWithRecoil(
      <LocalBotRuntime displayName="googleKeepSync" projectId={projectId} />,
      ({ set }) => {
        set(botStatusState(projectId), BotStatus.publishing);
      }
    );
    expect(container.innerHTML.includes('Spinner')).toBeTruthy();
  });
});
