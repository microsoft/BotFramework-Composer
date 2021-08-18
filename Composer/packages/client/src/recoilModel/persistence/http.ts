// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import httpClient from '../../utils/httpUtil';

import { decomposeComposite$Kinds } from './PVAUtils';

export const createFile = async (projectId: string, name: string, content: string) => {
  const response = await httpClient.post(`/projects/${projectId}/files`, {
    name,
    content: name.endsWith('.dialog') ? decomposeComposite$Kinds(JSON.parse(content)) : content,
  });
  return response.data;
};

export const deleteFile = async (projectId: string, name: string) => {
  await httpClient.delete(`/projects/${projectId}/files/${name}`);
};

export const updateFile = async (projectId: string, name: string, content: string) => {
  const response = await httpClient.put(`/projects/${projectId}/files/${name}`, {
    name,
    content: name.endsWith('.dialog') ? decomposeComposite$Kinds(JSON.parse(content)) : content,
  });
  return response.data;
};
