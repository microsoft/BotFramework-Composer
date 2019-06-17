export interface VisitorFunc {
  (path: string, value: any): boolean;
}

/**
 *
 * @param path jsonPath string
 * @param value current node value
 * @param visitor
 */

export const JsonWalk = (path: string, value: any, visitor: VisitorFunc) => {
  if (value === null || Array.isArray(value) || typeof value !== 'object') return;

  const stop = visitor(path, value);
  if (stop === true) return;

  Object.keys(value).forEach(key => {
    const nextPath = `${path}.${key}`;
    const nextValue = value[key];

    // extract array
    if (Array.isArray(nextValue)) {
      nextValue.forEach((child, index) => {
        JsonWalk(`${nextPath}[:${index}]`, child, visitor);
      });
    }

    const stop = visitor.call(null, nextPath, nextValue);

    if (stop === false) {
      JsonWalk(nextPath, nextValue, visitor);
    }
  });
};
