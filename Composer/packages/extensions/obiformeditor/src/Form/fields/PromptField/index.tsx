/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { FieldProps, IdSchema } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { Pivot, PivotLinkSize, PivotItem } from 'office-ui-fabric-react';
import get from 'lodash.get';
import pick from 'lodash.pick';
import { JSONSchema6 } from 'json-schema';

import { BaseField } from '../BaseField';

import { tabs, tabsContainer, settingsContainer } from './styles';
import { BotAsks } from './BotAsks';
import { UserAnswers } from './UserAnswers';
import { Exceptions } from './Exceptions';
import { PromptSettings } from './PromptSettings';

const resolveNewSchema = (schema: JSONSchema6, type: string): JSONSchema6 => {
  return get(schema, ['definitions', type]);
};

export const PromptField: React.FC<FieldProps> = props => {
  const promptSettingsIdSchema = ({ __id: props.idSchema.__id + 'promptSettings' } as unknown) as IdSchema;

  const getSchema = (field: keyof MicrosoftInputDialog): JSONSchema6 => {
    const fieldSchema = get(props.schema, ['properties', field]);

    return fieldSchema;
  };

  const updateField = (field: keyof MicrosoftInputDialog) => (data: any) => {
    if (field === '$type' && data !== props.formData.$type) {
      // remove extraneous properties
      const typeSchema = resolveNewSchema(props.schema, data);
      const newData = pick(props.formData, Object.keys(typeSchema.properties || {}));

      props.onChange({ ...newData, $type: data });
    } else {
      props.onChange({ ...props.formData, [field]: data });
    }
  };

  return (
    <BaseField {...props}>
      <div css={tabsContainer}>
        <Pivot linkSize={PivotLinkSize.large} styles={tabs}>
          <PivotItem headerText={formatMessage('Bot Asks')} itemKey="botAsks">
            <BotAsks {...props} onChange={updateField} getSchema={getSchema} />
          </PivotItem>
          <PivotItem headerText={formatMessage('User Answers')} itemKey="userAnswers">
            <UserAnswers {...props} onChange={updateField} getSchema={getSchema} />
          </PivotItem>
          <PivotItem headerText={formatMessage('Exceptions')} itemKey="exceptions">
            <Exceptions {...props} onChange={updateField} getSchema={getSchema} />
          </PivotItem>
        </Pivot>
      </div>

      <div className="ObjectItem ObjectItemContainer" css={settingsContainer}>
        <div className="ObjectItemField">
          <BaseField
            formContext={props.formContext}
            formData={props.formData}
            idSchema={promptSettingsIdSchema}
            title={formatMessage('Prompt settings')}
            schema={{}}
          >
            <PromptSettings {...props} onChange={updateField} getSchema={getSchema} />
          </BaseField>
        </div>
      </div>
    </BaseField>
  );
};
