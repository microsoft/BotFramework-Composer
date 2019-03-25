import { ruleDialogSelectorPolicy } from './selectorPolicy';
import { ruleDialogConnectorPolicy } from './connectorPolicy';
import { ruleDialogTransformerPolicy } from './transformerPolicy';
import { TraceablePolicy } from '../../types/TraceablePolicy';
import { ObiRuleDialog } from '../types/obi-dialogs/ObiRuleDialog';

export const ObiRuleDialogPolicies: TraceablePolicy<ObiRuleDialog, any, any> = {
  selectorPolicy: ruleDialogSelectorPolicy,
  connectorPolicy: ruleDialogConnectorPolicy,
  transformerPolicy: ruleDialogTransformerPolicy,
};
