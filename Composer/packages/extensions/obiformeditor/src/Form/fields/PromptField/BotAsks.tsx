// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core'
import React from 'react';
import formatMessage from 'format-message';
import { MicrosoftInputDialog } from '@bfc/shared';

import { LgEditorWidget } from '../../widgets/LgEditorWidget';
import { WidgetLabel } from '../../widgets/WidgetLabel';
import { BFDFieldProps } from '../../types';

import { field } from './styles';
import { GetSchema, PromptFieldChangeHandler } from './types';

interface BotAsksProps extends BFDFieldProps<MicrosoftInputDialog> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}

export const BotAsks: React.FC<BotAsksProps> = props => {
  const { onChange, getSchema, formData, formContext } = props;

  return (
    <div css={field}>
      <WidgetLabel label={formatMessage('Prompt')} description={getSchema('prompt').description} />
      <LgEditorWidget
        name="prompt"
        onChange={onChange('prompt')}
        value={formData.prompt}
        formContext={formContext}
        height={125}
      />
    </div>
  );
};
