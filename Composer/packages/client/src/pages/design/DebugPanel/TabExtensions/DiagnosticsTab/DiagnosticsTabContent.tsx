// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentProjectIdState, exportSkillModalInfoState } from '../../../../../recoilModel';
import { navigateTo } from '../../../../../utils/navigation';
import { DiagnosticList } from '../../../../diagnostics/DiagnosticList';

import { useDiagnosticsData } from './useDiagnostics';

export const DiagnosticsContent = () => {
  const skillId = useRecoilValue(currentProjectIdState);
  const setExportSkillModalInfo = useSetRecoilState(exportSkillModalInfoState);

  const diagnostics = useDiagnosticsData();

  return (
    <DiagnosticList
      diagnosticItems={diagnostics}
      skillId={skillId}
      onItemClick={(item) => {
        navigateTo(item.getUrl());
        if (item.location === 'manifest.json') {
          setExportSkillModalInfo(item.projectId);
        }
      }}
    />
  );
};
