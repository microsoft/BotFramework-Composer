import React from 'react';
import formatMessage from 'format-message';
import { IdSchema } from '@bfcomposer/react-jsonschema-form';
import get from 'lodash.get';
import { IChoiceOption, OBISchema } from 'shared';

import { field } from '../styles';
import { TextWidget, CheckboxWidget } from '../../../widgets';
import { FormContext } from '../../../types';

interface ChoiceOptionsProps {
  idSchema: IdSchema;
  schema: OBISchema;
  formData: IChoiceOption;
  onChange: (field: keyof IChoiceOption) => (data: any) => void;
  formContext: FormContext;
}

export const ChoiceOptions: React.FC<ChoiceOptionsProps> = props => {
  const { schema, formData, onChange, idSchema, formContext } = props;

  const optionSchema = (field: keyof IChoiceOption): OBISchema => {
    return get(schema, ['properties', field]);
  };

  return (
    <>
      <div css={field}>
        <TextWidget
          onChange={onChange('inlineSeparator')}
          schema={optionSchema('inlineSeparator')}
          id={idSchema.inlineSeparator && idSchema.inlineSeparator.__id}
          value={formData.inlineSeparator}
          label={formatMessage('Inline separator')}
          formContext={formContext}
        />
      </div>
      <div css={field}>
        <TextWidget
          onChange={onChange('inlineOr')}
          schema={optionSchema('inlineOr')}
          id={idSchema.inlineOr && idSchema.inlineOr.__id}
          value={formData.inlineOr}
          label={formatMessage('Inline or')}
          formContext={formContext}
        />
      </div>
      <div css={field}>
        <TextWidget
          onChange={onChange('inlineOrMore')}
          schema={optionSchema('inlineOrMore')}
          id={idSchema.inlineOrMore && idSchema.inlineOrMore.__id}
          value={formData.inlineOrMore}
          label={formatMessage('Inline or more')}
          formContext={formContext}
        />
      </div>
      <div css={field}>
        <CheckboxWidget
          onChange={onChange('includeNumbers')}
          schema={optionSchema('includeNumbers')}
          id={idSchema.includeNumbers && idSchema.includeNumbers.__id}
          value={formData.includeNumbers}
          label={formatMessage('Include numbers')}
          formContext={formContext}
        />
      </div>
    </>
  );
};
