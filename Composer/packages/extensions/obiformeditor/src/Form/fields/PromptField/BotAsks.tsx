import React from 'react';
import formatMessage from 'format-message';
import { MicrosoftInputDialog } from 'shared';

import { LgEditorWidget } from '../../widgets/LgEditorWidget';
import { WidgetLabel } from '../../widgets/WidgetLabel';
import { BFDFieldProps } from '../../types';

import { GetSchema, PromptFieldChangeHandler } from './types';

interface BotAsksProps extends BFDFieldProps<MicrosoftInputDialog> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}

export const BotAsks: React.FC<BotAsksProps> = props => {
  const { onChange, getSchema, formData, formContext } = props;

  return (
    <>
      <WidgetLabel label={formatMessage('Prompt')} description={getSchema('prompt').description} />
      <LgEditorWidget
        name="prompt"
        onChange={onChange('prompt')}
        value={formData.prompt}
        formContext={formContext}
        height={125}
      />
    </>
  );
};
