import path from 'path';

// handle all the path to unix pattern
class PathHandler {
  resolve(...params: string[]) {
    const pathToTransform = path.join(...params);
    console.log(pathToTransform);
    if (path.isAbsolute(pathToTransform)) return pathToTransform.replace(/\\/g, '/');
    return path.resolve(...params).replace(/\\/g, '/');
  }
  relative(from: string, to: string) {
    return path.relative(from, to).replace(/\\/g, '/');
  }
  basename(param: string, ext: string | undefined = undefined) {
    return path.posix.basename(param, ext);
  }
  dirname(param: string) {
    return path.posix.dirname(param);
  }
  join(...params: string[]) {
    return path.join(...params).replace(/\\/g, '/');
  }
  isAbsolute(param: string) {
    return path.isAbsolute(param);
  }
}
export const Path = new PathHandler();
