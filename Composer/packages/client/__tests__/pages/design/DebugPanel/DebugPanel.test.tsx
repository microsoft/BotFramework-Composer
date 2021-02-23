// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { DebugPanel } from '../../../../src/pages/design/DebugPanel/DebugPanel';
import { DiagnosticsTabKey } from '../../../../src/pages/design/DebugPanel/TabExtensions/DiagnosticsTab/constants';
import { debugPanelActiveTabState, debugPanelExpansionState } from '../../../../src/recoilModel';
import { renderWithRecoil } from '../../../testUtils/renderWithRecoil';

describe('<DebugPanel />', () => {
  const initRecoilState = ({ set }) => {
    set(debugPanelExpansionState, false);
    set(debugPanelActiveTabState, DiagnosticsTabKey);
  };

  it('should render the DebugPanel', () => {
    const { container } = renderWithRecoil(<DebugPanel />, initRecoilState);
    expect(container).toHaveTextContent('Problems');
    expect(container).toHaveTextContent('Webchat Inspector');
  });
});
