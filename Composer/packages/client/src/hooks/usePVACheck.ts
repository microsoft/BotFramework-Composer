// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { checkForPVASchema } from '@bfc/shared';
import { useRecoilValue } from 'recoil';

import { schemasState } from '../recoilModel';

export const usePVACheck = (projectId: string) => {
  const schema = useRecoilValue(schemasState(projectId));
  const isPVASchema = checkForPVASchema(schema.sdk);
  return isPVASchema;
};
