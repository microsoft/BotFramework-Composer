// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { DiagnosticSeverity } from '@bfc/shared';

import { allDiagnosticsSelectorFamily } from '../../../../../recoilModel';

import { IDiagnosticInfo } from './DiagnosticType';

export const useDiagnosticsData = (): IDiagnosticInfo[] => {
  const diagnosticData = useRecoilValue(
    allDiagnosticsSelectorFamily([DiagnosticSeverity.Error, DiagnosticSeverity.Warning])
  );

  return diagnosticData ?? [];
};

export const useDiagnosticsStatistics = () => {
  const diagnosticsData = useDiagnosticsData();

  const errorsCount = diagnosticsData.filter((d) => d.severity === DiagnosticSeverity.Error).length;
  const warningsCount = diagnosticsData.filter((d) => d.severity === DiagnosticSeverity.Warning).length;

  const hasError = errorsCount > 0;
  const hasWarning = warningsCount > 0;

  return {
    errorsCount,
    warningsCount,
    hasError,
    hasWarning,
  };
};
