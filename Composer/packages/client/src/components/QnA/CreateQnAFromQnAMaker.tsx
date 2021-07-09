// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment, useEffect } from 'react';
import formatMessage from 'format-message';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';

import { FieldConfig, useForm } from '../../hooks/useForm';

import { validateName, CreateQnAFromFormProps, CreateQnAFromQnAMakerFormData } from './constants';
import { knowledgeBaseStyle, subText } from './styles';

const formConfig: FieldConfig<CreateQnAFromQnAMakerFormData> = {
  name: {
    required: true,
    defaultValue: '',
  },
};

export const CreateQnAFromQnAMaker: React.FC<CreateQnAFromFormProps> = (props) => {
  const { onChange, qnaFiles, initialName } = props;

  formConfig.name.validate = validateName(qnaFiles);
  formConfig.name.defaultValue = initialName || '';
  const { formData, hasErrors } = useForm(formConfig);

  useEffect(() => {
    const disabled = hasErrors || !formData.name;
    onChange(formData, disabled);
  }, [formData]);

  return (
    <Fragment>
      <Stack>
        <Text styles={knowledgeBaseStyle}>
          {formatMessage('Import content from an existing knowledge base on the QnA maker portal')}
        </Text>
        <p>
          <span css={subText}>
            {formatMessage(
              'Import content from an existing knowledge base on the QnA maker portal. Your knowledge base will downloaded locally and source knowledge base will remain as-is.'
            )}
          </span>
        </p>
      </Stack>
    </Fragment>
  );
};

export default CreateQnAFromQnAMaker;
