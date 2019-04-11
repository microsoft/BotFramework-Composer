import find from 'lodash.find';
import get from 'lodash.get';
import set from 'lodash.set';

export function getExtension(filename) {
  if (typeof filename !== 'string') return filename;
  return filename.substring(filename.lastIndexOf('.') + 1, filename.length) || filename;
}

export function getBaseName(filename) {
  if (typeof filename !== 'string') return filename;
  return filename.substring(0, filename.lastIndexOf('.')) || filename;
}

function getTarget(dialogs, path) {
  const items = path.split('.');
  const name = items[0];
  items.splice(0, 1, 'content');
  const subPath = items.join('.');
  const object = find(dialogs, { name: name });
  return { object, subPath };
}

export function query(dialogs, path) {
  if (dialogs.length === 0 || !path) return '';
  const { object, subPath } = getTarget(dialogs, path);
  return get(object, subPath);
}

export function update(dialogs, path, newData) {
  if (dialogs.length === 0 || !path) return null;
  const { object, subPath } = getTarget(dialogs, path);
  return set(object, subPath, newData);
}
