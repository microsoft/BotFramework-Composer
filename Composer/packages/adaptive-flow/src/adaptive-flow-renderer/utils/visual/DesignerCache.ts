// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BaseSchema } from '@bfc/shared';
import get from 'lodash/get';

import { Boundary } from '../../models/Boundary';

export class DesignerCache {
  private MAX_CACHE_SIZE: number;
  private boundaryCache = {};
  private cacheSize = 0;

  constructor(MAX_CACHE_SIZE = 99999) {
    this.MAX_CACHE_SIZE = MAX_CACHE_SIZE;
  }

  private getActionDataHash(actionData: BaseSchema): string | null {
    const designerId = get(actionData, '$designer.id', '');
    if (!designerId) return null;

    const $kind = get(actionData, '$kind');
    return `${$kind}-${designerId}`;
  }

  cacheBoundary(actionData: BaseSchema, boundary: Boundary): boolean {
    const key = this.getActionDataHash(actionData);
    if (!key) {
      return false;
    }

    if (this.cacheSize >= this.MAX_CACHE_SIZE) {
      delete this.boundaryCache;
      this.boundaryCache = {};
      this.cacheSize = 0;
    }
    this.boundaryCache[key] = boundary;
    this.cacheSize += 1;
    return true;
  }

  uncacheBoundary(actionData: BaseSchema): boolean {
    const key = this.getActionDataHash(actionData);
    if (!key) return false;

    return delete this.boundaryCache[key];
  }

  loadBounary(actionData: BaseSchema): Boundary | undefined {
    const key = this.getActionDataHash(actionData);
    if (key) {
      return this.boundaryCache[key];
    }
  }
}

export const designerCache = new DesignerCache();
