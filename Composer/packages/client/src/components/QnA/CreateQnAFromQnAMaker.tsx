// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment, useEffect } from 'react';
import formatMessage from 'format-message';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Text } from 'office-ui-fabric-react/lib/Text';

import { FieldConfig, useForm } from '../../hooks/useForm';

import { validateName, CreateQnAFromFormProps, CreateQnAFromQnAMakerFormData } from './constants';
import { knowledgeBaseStyle, subText, textFieldKBNameFromScratch } from './styles';

const formConfig: FieldConfig<CreateQnAFromQnAMakerFormData> = {
  name: {
    required: true,
    defaultValue: '',
  },
};

export const CreateQnAFromQnAMaker: React.FC<CreateQnAFromFormProps> = (props) => {
  const { onChange, qnaFiles, initialName, onUpdateInitialName } = props;

  formConfig.name.validate = validateName(qnaFiles);
  formConfig.name.defaultValue = initialName || '';
  const { formData, updateField, hasErrors, formErrors } = useForm(formConfig);

  useEffect(() => {
    const disabled = hasErrors || !formData.name;
    onChange(formData, disabled);
  }, [formData]);

  return (
    <Fragment>
      <Stack>
        <Text styles={knowledgeBaseStyle}>
          {formatMessage('Import content from an existing KB on the QnA maker portal')}
        </Text>
        <p>
          <span css={subText}>
            {formatMessage(
              'Select this option when you want to import content from an existing KB on the QnA maker portal. The imported content will be mapped to the target locale you select'
            )}
          </span>
        </p>
      </Stack>
      <Stack>
        <TextField
          required
          data-testid={`knowledgeLocationTextField-name`}
          errorMessage={formErrors.name}
          label={formatMessage('Knowledge base name')}
          placeholder={formatMessage('Type a name for this knowledge base')}
          styles={textFieldKBNameFromScratch}
          value={formData.name}
          onChange={(e, name = '') => {
            updateField('name', name);
            onUpdateInitialName?.(name);
          }}
        />
      </Stack>
    </Fragment>
  );
};

export default CreateQnAFromQnAMaker;
