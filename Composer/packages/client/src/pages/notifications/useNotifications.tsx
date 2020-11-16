// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';

import { messagersSelector } from '../../recoilModel/selectors';

export default function useNotifications(_projectId: string, filter?: string) {
  const messagers = useRecoilValue(messagersSelector);
  return filter ? messagers.filter((x) => x.severity === filter) : messagers;
}
