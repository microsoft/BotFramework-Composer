import { TransformerImpl } from '../../policies/ObiRuleDialog/handlers/transformer/transform';

export type TransformerPolicyCollection = {
  [feature: string]: TransformerImpl<any>;
};
