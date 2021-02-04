// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { useRecoilValue } from 'recoil';

import { currentProjectIdState } from '../../../../../recoilModel';
import { DiagnosticList } from '../../../../diagnostics/DiagnosticList';

import { useDiagnosticsData } from './useDiagnosticsData';

export const DiagnosticsContent = () => {
  const skillId = useRecoilValue(currentProjectIdState);
  const diagnostics = useDiagnosticsData();

  return (
    <DiagnosticList
      diagnosticItems={diagnostics}
      skillId={skillId}
      onItemClick={() => {
        // TODO: migrate the navigation logic
      }}
    />
  );
};
