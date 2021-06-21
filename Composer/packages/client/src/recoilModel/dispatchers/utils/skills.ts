// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo } from '@botframework-composer/types';

import httpClient from '../../../utils/httpUtil';

export const addSkillFiles = async (
  projectId: string,
  skillName: string,
  url: string
): Promise<{ manifest: FileInfo | undefined; error?: any }> => {
  try {
    const response = await httpClient.post(`/projects/${projectId}/skillFiles`, { url, skillName });
    return { manifest: response.data };
  } catch (error) {
    return { manifest: undefined, error };
  }
};

export const deleteSkillFiles = async (projectId: string, skillName: string) => {
  await httpClient.delete(`/projects/${projectId}/skillFiles/${skillName}`);
};
