import { TraceableWhenHandler } from '../../../../connectors/types/ConnectionPolicy';

// Welcome should be connected to the only 'recognizer' directly.
export const shouldWelcomeFireConnection: TraceableWhenHandler<any> = (welcomeElements, root) => {
  return welcomeElements.length === 1 && root['recognizer'].length === 1;
};

// 'Intent's should be connected to the only 'recognizer' by their intent names.
export const shouldIntentFireConnection: TraceableWhenHandler<any> = (intentElements, root) => {
  return intentElements.length > 0 && root['recognizer'].length === 1;
};
