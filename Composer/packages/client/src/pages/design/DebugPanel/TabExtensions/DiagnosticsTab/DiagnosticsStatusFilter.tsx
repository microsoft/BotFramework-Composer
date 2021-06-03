// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { FontSizes, NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';

import { Severity, useDiagnosticsStatistics } from './useDiagnostics';

/**
 * Displays how many errors and warnings in current project.
 */
export const DiagnosticsStatusFilter = ({ filterType, onChangeFilterType }) => {
  const { errorsCount, warningsCount } = useDiagnosticsStatistics();
  const errorsMsg = `${errorsCount} ${errorsCount === 1 ? 'error' : 'errors'}`;
  const warningsMsg = `${warningsCount} ${warningsCount === 1 ? 'warning' : 'warnings'}`;

  return (
    <div
      css={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor: NeutralColors.gray10,
      }}
      data-testid="diagnostics-sidebar"
    >
      <DefaultButton
        iconProps={{ iconName: 'StatusErrorFull' }}
        styles={{
          root: {
            height: '24px',
            padding: 0,
            paddingRight: '3px',
            width: '100%',
            border: 'none',
            backgroundColor: filterType === Severity.Error ? NeutralColors.gray40 : NeutralColors.gray10,
          },
          flexContainer: { paddingLeft: '24px', justifyContent: 'inherit' },
          label: { fontSize: FontSizes.size12, fontFamily: 'Segoe UI', lineHeight: '12px', textAlign: 'left' },
          icon: { color: SharedColors.red10, fontSize: FontSizes.size14, lineHeight: '18px' },
        }}
        onClick={() => {
          onChangeFilterType(Severity.Error);
        }}
      >
        {formatMessage(`{errorsMsg}`, { errorsMsg })}
      </DefaultButton>
      <DefaultButton
        iconProps={{ iconName: 'WarningSolid' }}
        styles={{
          root: {
            height: '24px',
            padding: 0,
            paddingRight: '3px',
            border: 'none',
            width: '100%',
            backgroundColor: filterType === Severity.Warning ? NeutralColors.gray40 : NeutralColors.gray10,
          },
          flexContainer: { paddingLeft: '24px', justifyContent: 'inherit' },
          label: { fontSize: FontSizes.size12, fontFamily: 'Segoe UI', lineHeight: '12px', textAlign: 'left' },
          icon: { color: SharedColors.yellow10, fontSize: FontSizes.size14, lineHeight: '18px' },
        }}
        onClick={() => {
          onChangeFilterType(Severity.Warning);
        }}
      >
        {formatMessage(`{warningsMsg}`, { warningsMsg })}
      </DefaultButton>
    </div>
  );
};
