import { BaseSchema } from '@bfc/shared';
import { Boundary } from '../../models/Boundary';
export declare class DesignerCache {
    private MAX_CACHE_SIZE;
    private boundaryCache;
    private cacheSize;
    constructor(MAX_CACHE_SIZE?: number);
    private getActionDataHash;
    cacheBoundary(actionData: BaseSchema, boundary: Boundary): boolean;
    uncacheBoundary(actionData: BaseSchema): boolean;
    loadBounary(actionData: BaseSchema): Boundary | undefined;
}
export declare const designerCache: DesignerCache;
//# sourceMappingURL=DesignerCache.d.ts.map