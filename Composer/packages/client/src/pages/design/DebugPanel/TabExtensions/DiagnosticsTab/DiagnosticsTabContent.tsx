// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment, useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { Stack } from 'office-ui-fabric-react';

import { DebugPanelTabHeaderProps } from '../types';
import { IDiagnosticInfo } from '../../../../diagnostics/types';
import { dispatcherState, showErrorDiagnosticsState, showWarningDiagnosticsState } from '../../../../../recoilModel';

import { DiagnosticList } from './DiagnosticList';
import { Severity, useDiagnosticsData } from './useDiagnostics';
import { DiagnosticsFilters } from './DiagnosticFilters';

export const DiagnosticsContent: React.FC<DebugPanelTabHeaderProps> = ({ isActive }) => {
  const diagnostics = useDiagnosticsData();
  const { setWarningDiagnosticsFilter, setErrorDiagnosticsFilter } = useRecoilValue(dispatcherState);
  const showWarnings = useRecoilValue(showWarningDiagnosticsState);
  const showErrors = useRecoilValue(showErrorDiagnosticsState);
  const [projectsToFilter, setProjectsToFilter] = useState<string[]>([]);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [warningCount, setWarningCount] = useState<number>(0);
  const [filteredDiagnostics, setFilteredDiagnostics] = useState<IDiagnosticInfo[]>([]);

  useEffect(() => {
    let errorCt = 0;
    let warningCt = 0;
    const filteredItems = diagnostics.filter((diagnostic) => {
      const projectFilter = projectsToFilter.includes(diagnostic.projectId);
      if (!projectFilter) {
        return false;
      }

      let errorFilter = false;
      if (diagnostic.severity === Severity.Error) {
        errorCt++;
        if (showErrors) {
          errorFilter = true;
        }
      }

      let warningFilter = false;
      if (diagnostic.severity === Severity.Warning) {
        warningCt++;
        if (showWarnings) {
          warningFilter = true;
        }
      }
      return warningFilter || errorFilter;
    });
    setErrorCount(errorCt);
    setWarningCount(warningCt);
    setFilteredDiagnostics(filteredItems);
  }, [projectsToFilter, showWarnings, showErrors, diagnostics]);

  if (!isActive) {
    return null;
  }

  return (
    <div
      css={{
        height: '100%',
      }}
    >
      <div
        css={{
          display: 'flex',
          flex: '1 1 auto',
          height: '55px',
        }}
      >
        <DiagnosticsFilters
          errorCount={errorCount}
          projectsToFilter={projectsToFilter}
          setErrorFilter={setErrorDiagnosticsFilter}
          setProjectsToFilter={setProjectsToFilter}
          setWarningFilter={setWarningDiagnosticsFilter}
          showErrors={showErrors}
          showWarnings={showWarnings}
          warningCount={warningCount}
        />
      </div>

      <div
        css={{
          height: 'calc(100% - 55px)',
          overflowY: 'scroll',
        }}
        data-is-scrollable="true"
        data-testid="DiagnosticList-Container"
      >
        <DiagnosticList diagnosticItems={filteredDiagnostics} />
      </div>
    </div>
  );
};
