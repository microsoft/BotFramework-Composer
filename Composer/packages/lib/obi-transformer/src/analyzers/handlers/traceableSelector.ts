import { ObiSchema } from '../../models/obi/ObiSchema';
import { RuleTypes } from '../../models/obi/types/RuleTypes';
import { ObiStorage } from '../../models/obi/ObiStorage';
import { ObiRecognizer } from '../../models/obi/ObiRecognizer';
import { ObiRule } from '../../models/obi/ObiRule';

type TraceableData<T> = {
  data: T;
  path: string;
};

export const selectStorage = (obi: ObiSchema): TraceableData<ObiStorage> => {
  return {
    data: obi.storage,
    path: '$.storage',
  };
};

export const selectRecognizer = (obi: ObiSchema): TraceableData<ObiRecognizer> => {
  return {
    data: obi.recognizer,
    path: '$.recognizer',
  };
};

export const selectWelcome = (obi: ObiSchema): TraceableData<ObiRule> => {
  const index = obi.rules.findIndex(x => x.$type === RuleTypes.Welcome);
  return {
    data: obi.rules[index],
    path: `$.rules[${index}]`,
  };
};

export const selectFallback = (obi: ObiSchema): TraceableData<ObiRule> => {
  const index = obi.rules.findIndex(x => x.$type === RuleTypes.Fallback);
  return {
    data: obi.rules[index],
    path: `$.rules[${index}]`,
  };
};

export const selectPlainRules = (obi: ObiSchema): TraceableData<ObiRule>[] => {
  return obi.rules
    .map((rule, index) => ({
      data: rule,
      path: `$.rules[${index}]`,
    }))
    .filter(
      x =>
        // Not in special rules
        ![RuleTypes.Welcome, RuleTypes.Fallback].some(specialType => specialType === x.data.$type)
    );
};
