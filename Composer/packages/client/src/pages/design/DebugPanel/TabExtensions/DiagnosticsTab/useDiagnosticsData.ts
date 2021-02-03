// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';

import { IDiagnosticInfo } from '../../../../diagnostics/types';
import { currentProjectIdState, diagnosticsSelectorFamily } from '../../../../../recoilModel';

export const useDiagnosticsData = (): IDiagnosticInfo[] => {
  const skillId = useRecoilValue(currentProjectIdState);
  const diagnosticData = useRecoilValue(diagnosticsSelectorFamily(skillId));

  return diagnosticData ?? [];
};
