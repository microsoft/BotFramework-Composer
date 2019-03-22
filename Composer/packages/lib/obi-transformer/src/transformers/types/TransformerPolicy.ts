import { TransformerImpl } from '../../policies/ObiRuleDialog/handlers/transformer/transform';

export type TransformerPolicy = {
  [feature: string]: TransformerImpl<any>;
};
