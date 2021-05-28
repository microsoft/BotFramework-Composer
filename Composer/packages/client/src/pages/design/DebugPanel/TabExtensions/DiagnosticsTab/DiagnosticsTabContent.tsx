// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { DebugPanelTabHeaderProps } from '../types';
import { DiagnosticInfo } from '../../../../diagnostics/types';
import { dispatcherState, showErrorDiagnosticsState, showWarningDiagnosticsState } from '../../../../../recoilModel';

import { DiagnosticList } from './DiagnosticList';
import { Severity, useDiagnosticsData } from './useDiagnostics';
import { DiagnosticsFilters } from './DiagnosticFilters';

const runWarningFilter = (item: DiagnosticInfo, showWarnings: boolean) => {
  return showWarnings && item.severity === Severity.Warning;
};

const runErrorFilter = (item: DiagnosticInfo, showErrors: boolean) => {
  return showErrors && item.severity === Severity.Error;
};

const runProjectFilter = (projectsToFilter: string[], item: DiagnosticInfo) => {
  return projectsToFilter.includes(item.projectId);
};

export const DiagnosticsContent: React.FC<DebugPanelTabHeaderProps> = ({ isActive }) => {
  const diagnostics = useDiagnosticsData();
  const { setWarningDiagnosticsFilter: setShowWarnings, setErrorDiagnosticsFilter: setShowErrors } = useRecoilValue(
    dispatcherState
  );
  const showWarnings = useRecoilValue(showWarningDiagnosticsState);
  const showErrors = useRecoilValue(showErrorDiagnosticsState);
  const [projectsToFilter, setProjectsToFilter] = useState<string[]>([]);

  const filteredDiagnosticItems = useMemo(() => {
    const filtered = diagnostics.filter((diagnostic) => {
      return (
        runProjectFilter(projectsToFilter, diagnostic) &&
        (runErrorFilter(diagnostic, showErrors) || runWarningFilter(diagnostic, showWarnings))
      );
    });
    return filtered;
  }, [projectsToFilter, showWarnings, showErrors, diagnostics]);

  if (!isActive) {
    return null;
  }

  return (
    <Fragment>
      <div
        css={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <DiagnosticsFilters
          projectsToFilter={projectsToFilter}
          setProjectsToFilter={setProjectsToFilter}
          setShowErrors={setShowErrors}
          setShowWarnings={setShowWarnings}
          showErrors={showErrors}
          showWarnings={showWarnings}
        />
      </div>
      <div data-testid="DiagnosticList-Container" style={{ height: '100%', overflow: 'auto' }}>
        <DiagnosticList diagnosticItems={filteredDiagnosticItems} />
      </div>
    </Fragment>
  );
};
