// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { act, fireEvent } from '@botframework-composer/test-utils';
import * as React from 'react';

import { renderWithRecoil } from '../../../../__tests__/testUtils/renderWithRecoil';
import { debugPanelActiveTabState, debugPanelExpansionState } from '../../../recoilModel';
import TelemetryClient from '../../../telemetry/TelemetryClient';
import { DebugPanel } from '../DebugPanel/DebugPanel';

describe('<DebugPanel />', () => {
  let telemetrySpy;
  beforeEach(() => {
    telemetrySpy = jest.spyOn(TelemetryClient, 'track');
  });

  describe('<DebugPanel />', () => {
    it('should render Debug Panel', async () => {
      const { findByText } = renderWithRecoil(<DebugPanel />, () => {});
      await findByText('Web Chat');
      await findByText('Problems');
    });

    it('should render Debug Panel in expanded state', async () => {
      const initRecoilState = ({ set }) => {
        set(debugPanelActiveTabState, 'WebChatInspector');
        set(debugPanelExpansionState, true);
      };

      const { findByText } = renderWithRecoil(<DebugPanel />, initRecoilState);
      const element = await findByText('Web Chat');
      act(() => {
        fireEvent.click(element);

        expect(telemetrySpy).toHaveBeenCalledWith('DrawerPaneTabOpened', {
          tabType: 'WebChatInspector',
        });
      });
    });
  });
});
