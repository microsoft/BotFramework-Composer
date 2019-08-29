export function getExtension(filename?: string): string | any {
  if (typeof filename !== 'string') return filename;
  return filename.substring(filename.lastIndexOf('.') + 1, filename.length) || filename;
}

export function getBaseName(filename?: string): string | any {
  if (typeof filename !== 'string') return filename;
  return filename.substring(0, filename.lastIndexOf('.')) || filename;
}

export function upperCaseName(filename?: string): string | any {
  if (typeof filename !== 'string') return filename;
  return filename.charAt(0).toUpperCase() + filename.slice(1);
}

export function resolveToBasePath(base: string, relPath: string) {
  const leaf = relPath.startsWith('/') ? relPath : `/${relPath}`;
  return base === '/' ? leaf : `${base}${leaf}`;
}
