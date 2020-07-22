// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import httpClient from '../../utils/httpUtil';

export const createFile = async (projectId: string, name: string, content: string) => {
  const response = await httpClient.post(`/projects/${projectId}/files`, {
    name,
    content,
  });
  return response.data;
};

export const deleteFile = async (projectId: string, name: string) => {
  await httpClient.delete(`/projects/${projectId}/files/${name}`);
};

export const updateFile = async (projectId: string, name: string, content: string) => {
  const response = await httpClient.put(`/projects/${projectId}/files/${name}`, {
    name,
    content,
  });
  return response.data;
};
