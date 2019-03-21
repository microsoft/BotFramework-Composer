import { AnalyzerResult } from '../types/AnalyzerResult';

export const isTracable = (x: any) => {
  if (x.path && x.data) {
    return true;
  }
  return false;
};

export function validateRuleDialogComponents(input: AnalyzerResult): boolean {
  let rulesInTotal = 0;

  if (input.welcome) rulesInTotal++;
  if (input.fallback) rulesInTotal++;
  if (input.rules) rulesInTotal += input.rules.length;

  return rulesInTotal > 0;
}
