// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UserIdentity } from './user';

import { IBotProject } from '.';

export type BotProjectService = {
  getProjectById: (projectId: string, user?: UserIdentity) => Promise<IBotProject>;
};
