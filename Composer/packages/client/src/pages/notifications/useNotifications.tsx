// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';

import { messagersSelector } from '../../recoilModel/selectors';

export default function useNotifications(projectId: string, filter?: string) {
  console.log(projectId);
  const messagers = useRecoilValue(messagersSelector);
  return filter ? messagers.filter((x) => x.severity === filter) : messagers;
}
