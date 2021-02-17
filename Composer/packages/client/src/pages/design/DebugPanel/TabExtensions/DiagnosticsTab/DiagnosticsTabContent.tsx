// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { useSetRecoilState } from 'recoil';

import { exportSkillModalInfoState } from '../../../../../recoilModel';
import { navigateTo } from '../../../../../utils/navigation';

import { DiagnosticList } from './DiagnosticList';
import { useDiagnosticsData } from './useDiagnostics';

export const DiagnosticsContent = () => {
  const setExportSkillModalInfo = useSetRecoilState(exportSkillModalInfoState);
  const diagnostics = useDiagnosticsData();

  return (
    <DiagnosticList
      diagnosticItems={diagnostics}
      onItemClick={(item) => {
        navigateTo(item.getUrl());
        if (item.location === 'manifest.json') {
          setExportSkillModalInfo(item.projectId);
        }
      }}
    />
  );
};
