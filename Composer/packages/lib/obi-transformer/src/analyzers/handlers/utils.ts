export const iteratively = (fn: (...args) => any) => (x: any[]) => x.map(fn);
