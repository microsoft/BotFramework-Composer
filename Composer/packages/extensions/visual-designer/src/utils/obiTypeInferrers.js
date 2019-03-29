const includeSubstr = (input, substr) => {
  if (input.includes) {
    return input.includes(substr);
  }
  return false;
};

export const isRecognizerType = type => includeSubstr(type, 'Recognizer');

export const isIntentType = type => includeSubstr(type, 'Intent');

export const isWelcomeType = type => includeSubstr(type, 'Welcome');

export const isCallDialogType = type => includeSubstr(type, 'CallDialog');
