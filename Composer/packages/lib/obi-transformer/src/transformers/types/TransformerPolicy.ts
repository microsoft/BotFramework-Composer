import { TransformerImpl } from '../handlers/obiTransformers';

export type TransformerPolicyCollection = {
  [feature: string]: TransformerImpl<any>;
};
