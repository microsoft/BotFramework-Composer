export function getExtension(filename) {
  return filename.substring(filename.lastIndexOf('.') + 1, filename.length) || filename;
}

export function getBaseName(filename) {
  return filename.substring(0, filename.lastIndexOf('.')) || filename;
}
