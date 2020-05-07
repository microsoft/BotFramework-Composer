import React from 'react';
import { MicrosoftInputDialog } from '@bfc/shared';
import { BFDFieldProps } from '../../types';
import { GetSchema, PromptFieldChangeHandler } from './types';
interface BotAsksProps extends BFDFieldProps<MicrosoftInputDialog> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}
export declare const BotAsks: React.FC<BotAsksProps>;
export {};
