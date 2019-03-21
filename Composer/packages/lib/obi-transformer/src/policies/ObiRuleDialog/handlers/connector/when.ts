import { WhenHandler } from '../../../../connectors/types/ConnectionPolicy';

// Welcome should be connected to the only 'recognizer' directly.
export const shouldWelcomeFireConnection: WhenHandler = (welcomeElements, root) => {
  return welcomeElements.length === 1 && root['recognizer'].length === 1;
};

// 'Intent's should be connected to the only 'recognizer' by their intent names.
export const shouldIntentFireConnection: WhenHandler = (intentElements, root) => {
  return intentElements.length > 0 && root['recognizer'].length === 1;
};
