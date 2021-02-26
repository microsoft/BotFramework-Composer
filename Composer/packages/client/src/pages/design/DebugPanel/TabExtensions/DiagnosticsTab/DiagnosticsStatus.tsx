// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { useSetRecoilState } from 'recoil';
import { FontSizes, SharedColors } from '@uifabric/fluent-theme';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';

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

  if (!errorsCount && !warningsCount) return null;

  return (
    <div
      css={{ height: '100%', display: 'flex', alignItems: 'center', paddingLeft: '8px' }}
      data-testid="diagnostics-tab-header--collapsed"
    >
      <DefaultButton
        styles={{
          root: {
            height: '36px',
            padding: '0 5px',
            minWidth: '20px',
            border: 'none',
            marginRight: '8px',
          },
          label: { fontSize: FontSizes.size18, fontFamily: 'Segoe UI', lineHeight: '20px' },
        }}
        onClick={() => {
          setExpansion(true);
          setActiveTab(DiagnosticsTabKey);
        }}
      >
        {errorsCount > 0 && (
          <span css={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}>
            <FontIcon
              css={{ color: SharedColors.red10, fontSize: FontSizes.size18, lineHeight: '18px', marginRight: '5px' }}
              iconName="StatusErrorFull"
            />
            {errorsCount}
          </span>
        )}
        {warningsCount > 0 && (
          <span css={{ display: 'flex', alignItems: 'center' }}>
            <FontIcon
              css={{ color: SharedColors.yellow10, fontSize: FontSizes.size18, lineHeight: '18px', marginRight: '5px' }}
              iconName="WarningSolid"
            />
            {warningsCount}
          </span>
        )}
      </DefaultButton>
    </div>
  );
};
