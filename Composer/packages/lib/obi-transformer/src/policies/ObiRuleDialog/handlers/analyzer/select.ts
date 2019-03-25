import { ObiSchema } from '../../../../models/obi/ObiSchema';
import { RuleTypes } from '../../../../models/obi/types/RuleTypes';
import { ObiStorage } from '../../../../models/obi/ObiStorage';
import { ObiRecognizer } from '../../../../models/obi/ObiRecognizer';
import { ObiRule } from '../../../../models/obi/ObiRule';
import { TraceableData } from '../../../../types/TraceableData';

export type SelectorImpl = (obi: ObiSchema) => TraceableData<any>[];

const traceableFilter = (arr: any[], pathPrefix: string, judge: (x: any) => boolean) => {
  return arr
    .map((element, i) => (judge(element) ? { data: element, path: `${pathPrefix}[${i}]` } : null))
    .filter(x => x);
};

export const selectStorage = (obi: ObiSchema): TraceableData<ObiStorage>[] => {
  return [
    {
      data: obi.storage,
      path: '$.storage',
    },
  ];
};

export const selectRecognizer = (obi: ObiSchema): TraceableData<ObiRecognizer>[] => {
  return [
    {
      data: obi.recognizer,
      path: '$.recognizer',
    },
  ];
};

export const selectWelcome = (obi: ObiSchema): TraceableData<ObiRule>[] => {
  return traceableFilter(obi.rules, '$.rules', x => x.$type === RuleTypes.Welcome);
};

export const selectFallback = (obi: ObiSchema): TraceableData<ObiRule>[] => {
  return traceableFilter(obi.rules, '$.rules', x => x.$type === RuleTypes.Fallback);
};

export const selectIntent = (obi: ObiSchema): TraceableData<ObiRule>[] => {
  return traceableFilter(obi.rules, '$.rules', x => x.$type === RuleTypes.Intent);
};

export const selectPlainRules = (obi: ObiSchema): TraceableData<ObiRule>[] => {
  const notSpecialRules = x =>
    ![RuleTypes.Welcome, RuleTypes.Fallback, RuleTypes.Intent].some(specialType => specialType === x.$type);

  return traceableFilter(obi.rules, '$.rules', notSpecialRules);
};
