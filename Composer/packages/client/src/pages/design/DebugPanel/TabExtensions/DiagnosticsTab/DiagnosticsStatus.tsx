// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { useSetRecoilState } from 'recoil';
import { SharedColors, FontSizes } from '@uifabric/fluent-theme';

import { debugPanelExpansionState, debugPanelActiveTabState } from '../../../../../recoilModel';
import { DiagnosticsTabKey } from '../types';

import { useDiagnosticsStatistics } from './useDiagnostics';

/**
 * Displays how many errors and warnings in current project.
 */
export const DiagnosticsStatus = () => {
  const setExpansion = useSetRecoilState(debugPanelExpansionState);
  const setActiveTab = useSetRecoilState(debugPanelActiveTabState);
  const { errorsCount, warningsCount } = useDiagnosticsStatistics();

  return (
    <div
      css={{ height: '100%', display: 'flex', alignItems: 'center', paddingLeft: '8px' }}
      data-testid="diagnostics-tab-header--collapsed"
    >
      <DefaultButton
        iconProps={{ iconName: 'StatusErrorFull' }}
        styles={{
          root: {
            height: '36px',
            padding: 0,
            paddingRight: '3px',
            minWidth: '20px',
            border: 'none',
            marginRight: '8px',
          },
          label: { fontSize: FontSizes.size18, fontFamily: 'Segoe UI', lineHeight: '20px' },
          icon: { color: `${SharedColors.red10}`, fontSize: FontSizes.size18, lineHeight: '18px' },
        }}
        onClick={() => {
          setExpansion(true);
          setActiveTab(DiagnosticsTabKey);
        }}
      >
        {errorsCount}
      </DefaultButton>
      <DefaultButton
        iconProps={{ iconName: 'WarningSolid' }}
        styles={{
          root: { height: '36px', padding: 0, paddingRight: '3px', border: 'none', minWidth: '20px' },
          label: { fontSize: FontSizes.size18, fontFamily: 'Segoe UI', lineHeight: '20px' },
          icon: { color: `${SharedColors.yellow10}`, fontSize: FontSizes.size18, lineHeight: '18px' },
        }}
        onClick={() => {
          setExpansion(true);
        }}
      >
        {warningsCount}
      </DefaultButton>
    </div>
  );
};
