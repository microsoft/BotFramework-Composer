// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Split } from '@geoffcox/react-splitter';
import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';

import { renderThinSplitter } from '../../../../../components/Split/ThinSplitter';
import { exportSkillModalInfoState } from '../../../../../recoilModel';
import { navigateTo } from '../../../../../utils/navigation';

import { DiagnosticList } from './DiagnosticList';
import { DiagnosticsStatusFilter } from './DiagnosticsStatusFilter';
import { Severity, useDiagnosticsData } from './useDiagnostics';

export const DiagnosticsContent = () => {
  const setExportSkillModalInfo = useSetRecoilState(exportSkillModalInfoState);
  const [filterType, setFilterType] = useState(Severity.Error);
  const diagnostics = useDiagnosticsData();

  const changeFilterType = (type) => {
    setFilterType(type);
  };
  return (
    <Split
      resetOnDoubleClick
      initialPrimarySize="20%"
      minPrimarySize="200px"
      minSecondarySize="800px"
      renderSplitter={renderThinSplitter}
      splitterSize="5px"
    >
      <DiagnosticsStatusFilter filterType={filterType} onChangeFilterType={changeFilterType} />
      <DiagnosticList
        diagnosticItems={diagnostics.filter((d) => d.severity === filterType)}
        onItemClick={(item) => {
          navigateTo(item.getUrl());
          if (item.location === 'manifest.json') {
            setExportSkillModalInfo(item.projectId);
          }
        }}
      />
    </Split>
  );
};
