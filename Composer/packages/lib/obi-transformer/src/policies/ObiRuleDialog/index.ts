import { ruleDialogAnalyzerPolicy } from './analyzerPolicy';
import { ruleDialogConnectorPolicy } from './connectorPolicy';
import { ruleDialogTransformerPolicy } from './transformerPolicy';
import { TraceablePolicy } from '../../types/TraceablePolicy';
import { ObiRuleDialog } from '../types/obi-dialogs/ObiRuleDialog';

export const ObiRuleDialogPolicies: TraceablePolicy<ObiRuleDialog, any, any> = {
  selectorPolicy: ruleDialogAnalyzerPolicy,
  connectorPolicy: ruleDialogConnectorPolicy,
  transformerPolicy: ruleDialogTransformerPolicy,
};
