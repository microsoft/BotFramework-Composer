// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { DiagnosticSeverity } from '@bfc/shared';
import { Stack } from 'office-ui-fabric-react/lib/Stack';

import { DebugPanelTabHeaderProps } from '../types';
import { dispatcherState, showErrorDiagnosticsState, showWarningDiagnosticsState } from '../../../../../recoilModel';

import { DiagnosticList } from './DiagnosticList';
import { useDiagnosticsData } from './useDiagnostics';
import { DiagnosticsFilters } from './DiagnosticFilters';

const severityFilterHeight = 32;

export const DiagnosticsContent: React.FC<DebugPanelTabHeaderProps> = ({ isActive }) => {
  const diagnostics = useDiagnosticsData();
  const { setWarningDiagnosticsFilter, setErrorDiagnosticsFilter } = useRecoilValue(dispatcherState);
  const showWarnings = useRecoilValue(showWarningDiagnosticsState);
  const showErrors = useRecoilValue(showErrorDiagnosticsState);
  const [projectsToFilter, setProjectsToFilter] = useState<string[]>([]);

  const { filteredDiagnostics, errorCount, warningCount } = useMemo(() => {
    let countOfErrors = 0;
    let countOfWarnings = 0;
    const filteredItems = diagnostics.filter((diagnostic) => {
      const projectFilter = projectsToFilter.includes(diagnostic.projectId);

      if (!projectFilter) {
        return false;
      }

      let errorFilter = false;

      if (diagnostic.severity === DiagnosticSeverity.Error) {
        countOfErrors++;
        if (showErrors) {
          errorFilter = true;
        }
      }

      let warningFilter = false;
      if (diagnostic.severity === DiagnosticSeverity.Warning) {
        countOfWarnings++;
        if (showWarnings) {
          warningFilter = true;
        }
      }
      return warningFilter || errorFilter;
    });

    return {
      filteredDiagnostics: filteredItems,
      errorCount: countOfErrors,
      warningCount: countOfWarnings,
    };
  }, [projectsToFilter, showWarnings, showErrors, diagnostics]);

  if (!isActive) {
    return null;
  }
  return (
    <Stack verticalFill>
      <Stack.Item
        css={{
          height: `${severityFilterHeight}px`,
          marginTop: '14px',
          padding: '0 16px',
          alignItems: 'center',
        }}
      >
        <DiagnosticsFilters
          errorCount={errorCount}
          projectsToFilter={projectsToFilter}
          showErrors={showErrors}
          showWarnings={showWarnings}
          warningCount={warningCount}
          onErrorFilterChange={setErrorDiagnosticsFilter}
          onProjectFilterChange={setProjectsToFilter}
          onWarningFilterChange={setWarningDiagnosticsFilter}
        />
      </Stack.Item>
      <Stack.Item
        css={{
          height: `calc(100% - ${severityFilterHeight}px)`,
          position: 'relative',
        }}
      >
        <DiagnosticList diagnosticItems={filteredDiagnostics} />
      </Stack.Item>
    </Stack>
  );
};
