import { ObiTypes } from '../constants/ObiTypes';

export function buildObiStep(data) {
  let step = data;
  // Grammar sugar provide by OBI runtime.
  if (typeof data === 'string') {
    step = {
      $type: ObiTypes.CallDialog,
      dialog: { $ref: step },
    };
  }
  return step;
}
