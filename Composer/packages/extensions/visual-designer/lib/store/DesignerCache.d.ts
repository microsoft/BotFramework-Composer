import { BaseSchema } from '@bfc/shared';
import { Boundary } from '../models/Boundary';
export declare class DesignerCache {
  private boundaryCache;
  private cacheSize;
  private getActionDataHash;
  cacheBoundary(actionData: BaseSchema, boundary: Boundary): boolean;
  uncacheBoundary(actionData: BaseSchema): boolean;
  loadBounary(actionData: BaseSchema): Boundary | undefined;
}
export declare const designerCache: DesignerCache;
//# sourceMappingURL=DesignerCache.d.ts.map
