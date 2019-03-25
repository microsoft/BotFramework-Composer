import { ObiRuleDialog } from '../../../types/obi-dialogs/ObiRuleDialog';
import { RuleTypes } from '../../../types/obi-enums/ObiRuleTypes';
import { ObiStorage } from '../../../types/obi-elements/ObiStorage';
import { ObiRecognizer } from '../../../types/obi-elements/ObiRecognizer';
import { ObiRule } from '../../../types/obi-elements/ObiRule';
import { TraceableSelectionHandler } from '../../../../selectors/types/SelectorPolicy';
import { TraceableData } from '../../../../types/TraceableData';

export const selectStorage: TraceableSelectionHandler<ObiRuleDialog, ObiStorage> = obi => {
  return [
    {
      data: obi.storage,
      path: '$.storage',
    },
  ];
};

export const selectRecognizer: TraceableSelectionHandler<ObiRuleDialog, ObiRecognizer> = obi => {
  return [
    {
      data: obi.recognizer,
      path: '$.recognizer',
    },
  ];
};

const traceableRuleFilter = (
  arr: ObiRule[],
  pathPrefix: string,
  judge: (x: ObiRule) => boolean
): TraceableData<ObiRule>[] => {
  return arr
    .map((element, i) => (judge(element) ? { data: element, path: `${pathPrefix}[${i}]` } : null))
    .filter(x => x);
};

export const selectWelcome: TraceableSelectionHandler<ObiRuleDialog, ObiRule> = obi => {
  return traceableRuleFilter(obi.rules, '$.rules', x => x.$type === RuleTypes.Welcome);
};

export const selectFallback: TraceableSelectionHandler<ObiRuleDialog, ObiRule> = obi => {
  return traceableRuleFilter(obi.rules, '$.rules', x => x.$type === RuleTypes.Fallback);
};

export const selectIntent: TraceableSelectionHandler<ObiRuleDialog, ObiRule> = obi => {
  return traceableRuleFilter(obi.rules, '$.rules', x => x.$type === RuleTypes.Intent);
};

export const selectPlainRules: TraceableSelectionHandler<ObiRuleDialog, ObiRule> = obi => {
  const notSpecialRules = x =>
    ![RuleTypes.Welcome, RuleTypes.Fallback, RuleTypes.Intent].some(specialType => specialType === x.$type);

  return traceableRuleFilter(obi.rules, '$.rules', notSpecialRules);
};
