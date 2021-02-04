// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { useRecoilState } from 'recoil';

import { debugPanelExpansionState } from '../../../../../recoilModel';
import { DiagnosticSeverity } from '../../../../diagnostics/types';

import { useDiagnosticsData } from './useDiagnosticsData';

const Severity = {
  Error: DiagnosticSeverity[0],
  Warning: DiagnosticSeverity[1],
};

export const DiagnosticsHeaderCollapsed = 'Issues';

export const DiagnosticsHeaderExpanded = 'Issues';

/**
 * Displays how many errors and warnings in current project.
 */
export const DiagnosticsStatus = () => {
  const [, setExpansion] = useRecoilState(debugPanelExpansionState);
  const diagnosticsData = useDiagnosticsData();

  const errorsCount = diagnosticsData.filter((d) => d.severity === Severity.Error).length;
  const warningsCount = diagnosticsData.filter((d) => d.severity === Severity.Warning).length;

  return (
    <div
      css={{ height: '100%', display: 'flex', alignItems: 'center', paddingLeft: '8px' }}
      data-testid="diagnostics-tab-header--collapsed"
    >
      <DefaultButton
        iconProps={{ iconName: 'StatusErrorFull' }}
        styles={{
          root: { height: '18px', padding: 0, paddingRight: '3px', minWidth: '20px', marginRight: '8px' },
          label: { fontSize: '10px', fontFamily: 'Segoe UI', lineHeight: '20px' },
          icon: { color: '#EB3941', fontSize: '10px', lineHeight: '16px' },
        }}
        onClick={() => {
          setExpansion(true);
        }}
      >
        {errorsCount} Errors
      </DefaultButton>
      <DefaultButton
        iconProps={{ iconName: 'WarningSolid' }}
        styles={{
          root: { height: '18px', padding: 0, paddingRight: '3px', minWidth: '20px' },
          label: { fontSize: '10px', fontFamily: 'Segoe UI', lineHeight: '20px' },
          icon: { color: '#F4BD00', fontSize: '10px', lineHeight: '16px' },
        }}
        onClick={() => {
          setExpansion(true);
        }}
      >
        {warningsCount} Warnings
      </DefaultButton>
    </div>
  );
};
