import { ObiRuleDialog } from '../../../types/obi-dialogs/ObiRuleDialog';
import { RuleTypes } from '../../../types/obi-enums/ObiRuleTypes';
import { ObiStorage } from '../../../types/obi-elements/ObiStorage';
import { ObiRecognizer } from '../../../types/obi-elements/ObiRecognizer';
import { ObiRule } from '../../../types/obi-elements/ObiRule';
import { TraceableData } from '../../../../types/TraceableData';

export type SelectorImpl = (obi: ObiRuleDialog) => TraceableData<any>[];

const traceableFilter = (arr: any[], pathPrefix: string, judge: (x: any) => boolean) => {
  return arr
    .map((element, i) => (judge(element) ? { data: element, path: `${pathPrefix}[${i}]` } : null))
    .filter(x => x);
};

export const selectStorage = (obi: ObiRuleDialog): TraceableData<ObiStorage>[] => {
  return [
    {
      data: obi.storage,
      path: '$.storage',
    },
  ];
};

export const selectRecognizer = (obi: ObiRuleDialog): TraceableData<ObiRecognizer>[] => {
  return [
    {
      data: obi.recognizer,
      path: '$.recognizer',
    },
  ];
};

export const selectWelcome = (obi: ObiRuleDialog): TraceableData<ObiRule>[] => {
  return traceableFilter(obi.rules, '$.rules', x => x.$type === RuleTypes.Welcome);
};

export const selectFallback = (obi: ObiRuleDialog): TraceableData<ObiRule>[] => {
  return traceableFilter(obi.rules, '$.rules', x => x.$type === RuleTypes.Fallback);
};

export const selectIntent = (obi: ObiRuleDialog): TraceableData<ObiRule>[] => {
  return traceableFilter(obi.rules, '$.rules', x => x.$type === RuleTypes.Intent);
};

export const selectPlainRules = (obi: ObiRuleDialog): TraceableData<ObiRule>[] => {
  const notSpecialRules = x =>
    ![RuleTypes.Welcome, RuleTypes.Fallback, RuleTypes.Intent].some(specialType => specialType === x.$type);

  return traceableFilter(obi.rules, '$.rules', notSpecialRules);
};
