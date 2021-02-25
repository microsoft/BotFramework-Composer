// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Split } from '@geoffcox/react-splitter';
import React, { useState } from 'react';

import { renderThinSplitter } from '../../../../../components/Split/ThinSplitter';

import { DiagnosticList } from './DiagnosticList';
import { DiagnosticsStatusFilter } from './DiagnosticsStatusFilter';
import { Severity, useDiagnosticsData } from './useDiagnostics';

export const DiagnosticsContent = () => {
  const [filterType, setFilterType] = useState(Severity.Error);
  const diagnostics = useDiagnosticsData();

  const changeFilterType = (type) => {
    setFilterType(type);
  };
  return (
    <Split
      resetOnDoubleClick
      initialPrimarySize="160px"
      minPrimarySize="140px"
      minSecondarySize="600px"
      renderSplitter={renderThinSplitter}
      splitterSize="5px"
    >
      <DiagnosticsStatusFilter filterType={filterType} onChangeFilterType={changeFilterType} />
      <div data-testid="DiagnosticList-Container" style={{ height: '100%', overflow: 'auto' }}>
        <DiagnosticList diagnosticItems={diagnostics.filter((d) => d.severity === filterType)} />
      </div>
    </Split>
  );
};
