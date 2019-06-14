import path from 'path';

// handle all the path to unix pattern
class PathHandler {
  resolve(...params: string[]) {
    const pathToTransform = path.join(...params);
    if (path.isAbsolute(pathToTransform)) {
      return pathToTransform.replace(/\\/g, '/');
    } else {
      return path.resolve(...params).replace(/\\/g, '/');
    }
  }
  relative(from: string, to: string) {
    return path.relative(from, to).replace(/\\/g, '/');
  }
  basename(param: string, ext: string | undefined = undefined) {
    return path.basename(param, ext).replace(/\\/g, '/');
  }
  dirname(param: string) {
    return path.dirname(param).replace(/\\/g, '/');
  }
  extname(param: string) {
    return path.extname(param).replace(/\\/g, '/');
  }
  join(...params: string[]) {
    return path.join(...params).replace(/\\/g, '/');
  }
  isAbsolute(param: string) {
    return path.isAbsolute(param);
  }
}
export const Path = new PathHandler();
