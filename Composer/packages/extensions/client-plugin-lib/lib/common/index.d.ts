/// <reference types="react" />
/** Renders a react component within a Composer plugin surface. */
export declare function render(component: React.ReactElement): void;
/** Allows plugin client bundles to make AJAX calls from the server -- avoiding the issue of CORS */
declare function fetchProxy(url: string, options: RequestInit): Promise<Response>;
export { fetchProxy as fetch };
//# sourceMappingURL=index.d.ts.map
