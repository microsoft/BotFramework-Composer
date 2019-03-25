import { TraceableValidationHandler } from '../../../../selectors/types/SelectorPolicy';

export const isTracable: TraceableValidationHandler<any> = x => {
  if (x.path && x.data) {
    return true;
  }
  return false;
};
