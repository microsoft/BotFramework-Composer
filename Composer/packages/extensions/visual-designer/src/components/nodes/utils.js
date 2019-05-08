import get from 'lodash.get';

export function getFriendlyName(data) {
  return get(data, '$designer.name');
}
