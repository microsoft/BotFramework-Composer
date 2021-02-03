// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { useRecoilValue } from 'recoil';

import { currentProjectIdState, diagnosticsSelectorFamily } from '../../../../../recoilModel';
import { DiagnosticList } from '../../../../diagnostics/DiagnosticList';

export const DiagnosticsContent = () => {
  const skillId = useRecoilValue(currentProjectIdState);
  const diagnostics = useRecoilValue(diagnosticsSelectorFamily(skillId));

  return <DiagnosticList diagnosticItems={diagnostics} skillId={skillId} onItemClick={() => {}} />;
};
