// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BaseSchema } from '@bfc/shared';
import get from 'lodash/get';

import { Boundary } from '../models/Boundary';

const MAX_CACHE_SIZE = 99999;

export class DesignerCache {
  private boundaryCache = {};
  private cacheSize = 0;

  private getActionDataHash(actionData: BaseSchema): string | null {
    const designerId = get(actionData, '$designer.id', '');
    if (!designerId) return null;

    const $type = get(actionData, '$type');
    return `${$type}-${designerId}`;
  }

  cacheBoundary(actionData: BaseSchema, boundary: Boundary): boolean {
    const key = this.getActionDataHash(actionData);
    if (!key) {
      return false;
    }

    if (this.cacheSize > MAX_CACHE_SIZE) {
      delete this.boundaryCache;
      this.boundaryCache = {};
      this.cacheSize = 0;
    }
    this.boundaryCache[key] = boundary;
    this.cacheSize += 1;
    return true;
  }

  loadBounary(actionData: BaseSchema): Boundary | undefined {
    const key = this.getActionDataHash(actionData);
    if (key) {
      return this.boundaryCache[key];
    }
  }
}

export const designerCache = new DesignerCache();
