import { ObiTypes } from '../constants/ObiTypes';

export function buildObiStep(data) {
  let step = data;
  // Grammar sugar provide by OBI runtime.
  if (typeof data === 'string') {
    step = {
      $type: ObiTypes.BeginDialog,
      dialog: step,
    };
  }
  return step;
}
