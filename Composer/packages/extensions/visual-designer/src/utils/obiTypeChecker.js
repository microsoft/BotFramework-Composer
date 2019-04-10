export function isRecognizer(input) {
  return typeof input === 'object' && input.$type;
}
