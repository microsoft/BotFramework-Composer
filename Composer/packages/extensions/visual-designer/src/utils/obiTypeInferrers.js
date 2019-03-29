const includeSubstr = (input, substr) => {
  if (input.includes) {
    return input.includes(substr);
  }
  return false;
};

export const isRecognizerType = type => includeSubstr(type, 'Recognizer');

export const isIntentType = type => includeSubstr(type, 'Intent');

export const isRuleType = type => includeSubstr(type, 'Rule');

export const isWelcomeType = type => includeSubstr(type, 'Welcome');

export const isCallDialogType = type => includeSubstr(type, 'CallDialog');

export const isRefType = type => type === '$ref';
