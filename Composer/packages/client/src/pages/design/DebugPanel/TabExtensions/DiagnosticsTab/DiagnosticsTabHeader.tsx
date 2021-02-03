// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { DiagnosticSeverity } from '../../../../diagnostics/types';

import { useDiagnosticsData } from './useDiagnosticsData';

const Severity = {
  Error: DiagnosticSeverity[0],
  Warning: DiagnosticSeverity[1],
};
export const DiagnosticsHeaderCollapsed = () => {
  const diagnosticsData = useDiagnosticsData();
  const errorsCount = diagnosticsData.filter((d) => d.severity === Severity.Error).length;
  const warningsCount = diagnosticsData.filter((d) => d.severity === Severity.Warning).length;
  return <div>{`Errors: ${errorsCount}; Warnings: ${warningsCount}`}</div>;
};

export const DiagnosticsHeaderExpanded = 'Problems';
