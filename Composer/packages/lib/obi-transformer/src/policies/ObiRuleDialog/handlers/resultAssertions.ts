export const isTracable = (x: any) => {
  if (x.path && x.data) {
    return true;
  }
  return false;
};

export function validateRuleDialogComponents(input): boolean {
  let recognizerCnt = input['recognizer'].length;
  let welcomeCnt = input['welcome'].length;
  let fallbackCnt = input['fallback'].length;
  let intentCnt = input['intent'].length;

  if (recognizerCnt !== 1) return false;
  if (welcomeCnt + fallbackCnt + intentCnt === 0) return false;
  return true;
}
