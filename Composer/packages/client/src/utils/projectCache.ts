// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ClientStorage } from './storage';

const KEY = 'ProjectIdCache';

class ProjectIdCache {
  private storage: ClientStorage;
  private currentProjectId;

  constructor() {
    this.storage = new ClientStorage(window.sessionStorage);
    this.currentProjectId = this.storage.get(KEY, '');
  }

  get() {
    return this.currentProjectId;
  }

  set(projectId: string) {
    this.currentProjectId = projectId;
    this.storage.set(KEY, this.currentProjectId);
  }

  clear() {
    this.set('');
  }
}

export const projectIdCache = new ProjectIdCache();
