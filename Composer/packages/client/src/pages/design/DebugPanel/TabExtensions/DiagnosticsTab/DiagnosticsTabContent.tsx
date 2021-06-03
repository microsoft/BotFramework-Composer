// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Split } from '@geoffcox/react-splitter';
import React, { useState } from 'react';

import { renderThinSplitter } from '../../../../../components/Split/ThinSplitter';
import { DebugPanelTabHeaderProps } from '../types';

import { DiagnosticList } from './DiagnosticList';
import { DiagnosticsStatusFilter } from './DiagnosticsStatusFilter';
import { Severity, useDiagnosticsData } from './useDiagnostics';

export const DiagnosticsContent: React.FC<DebugPanelTabHeaderProps> = ({ isActive }) => {
  const [filterType, setFilterType] = useState(Severity.Error);
  const diagnostics = useDiagnosticsData();

  const changeFilterType = (type) => {
    setFilterType(type);
  };

  if (!isActive) {
    return null;
  }

  return (
    <Split
      resetOnDoubleClick
      css={{
        height: '100%',
        display: !isActive ? 'none' : 'block',
        overflow: 'auto',
      }}
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
