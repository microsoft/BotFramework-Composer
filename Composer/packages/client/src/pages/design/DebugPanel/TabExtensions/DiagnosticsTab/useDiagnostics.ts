// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';

import { allDiagnosticsSelectorFamily } from '../../../../../recoilModel';

import { IDiagnosticInfo } from './types';
import { DiagnosticSeverity } from './types';

export const Severity = {
  Error: DiagnosticSeverity[0],
  Warning: DiagnosticSeverity[1],
};

export const useDiagnosticsData = (): IDiagnosticInfo[] => {
  const diagnosticData = useRecoilValue(allDiagnosticsSelectorFamily('All'));

  return diagnosticData ?? [];
};

export const useDiagnosticsStatistics = () => {
  const diagnosticsData = useDiagnosticsData();

  const errorsCount = diagnosticsData.filter((d) => d.severity === Severity.Error).length;
  const warningsCount = diagnosticsData.filter((d) => d.severity === Severity.Warning).length;

  const hasError = errorsCount > 0;
  const hasWarning = warningsCount > 0;

  return {
    errorsCount,
    warningsCount,
    hasError,
    hasWarning,
  };
};
