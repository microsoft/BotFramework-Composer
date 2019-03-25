export function validateRuleDialogComponents(input): boolean {
  const recognizerCnt = input['recognizer'].length;
  const welcomeCnt = input['welcome'].length;
  const fallbackCnt = input['fallback'].length;
  const intentCnt = input['intent'].length;

  if (recognizerCnt !== 1) return false;
  if (welcomeCnt + fallbackCnt + intentCnt === 0) return false;
  return true;
}
