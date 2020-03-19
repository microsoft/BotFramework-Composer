/* eslint-disable format-message/literal-pattern */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import formatMessage from 'format-message';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { MicrosoftInputDialog } from '@bfc/shared';

import { TextWidget } from '../../widgets';

import { field, settingsFieldHalf, settingsFields, settingsFieldFull, settingsFieldValidation } from './styles';
import { PromptFieldChangeHandler, GetSchema, InputDialogKeys } from './types';

interface TwoSettingFieldsProps extends FieldProps<MicrosoftInputDialog> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
  fields: { [key: string]: InputDialogKeys | string }[];
}
export const TwoSettingFields: React.FC<TwoSettingFieldsProps> = props => {
  const { fields, formData, idSchema, getSchema, onChange, errorSchema } = props;
  const errs: (JSX.Element | string | undefined)[] = [];
  const [errorMessage, setErrorMessage] = useState<JSX.Element | string | undefined>();

  const onValidate = (index: number, err?: JSX.Element | string | undefined) => {
    errs[index] = err;
    setErrorMessage(errs.find(err => err || null));
  };

  return (
    <div css={settingsFields}>
      {fields.map((settingField, index) => (
        <div key={index} css={[field, settingsFieldHalf]}>
          <TextWidget
            onChange={onChange(settingField.name as InputDialogKeys)}
            schema={getSchema(settingField.name as InputDialogKeys)}
            id={idSchema[settingField.name].__id}
            value={formData[settingField.name]}
            label={formatMessage(settingField.title as string)}
            formContext={props.formContext}
            rawErrors={errorSchema[settingField.name] && errorSchema[settingField.name].__errors}
            hiddenErrMessage={true}
            onValidate={errMsg => {
              onValidate(index, errMsg);
            }}
          />
        </div>
      ))}
      <div css={[field, settingsFieldFull, settingsFieldValidation]}>{errorMessage}</div>
    </div>
  );
};
