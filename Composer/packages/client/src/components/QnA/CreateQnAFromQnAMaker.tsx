// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment, useEffect, useState } from 'react';
import formatMessage from 'format-message';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';

import { FieldConfig, useForm } from '../../hooks/useForm';
import { userShouldProvideTokens } from '../../utils/auth';
import { AuthClient } from '../../utils/authClient';

import { validateName, CreateQnAFromFormProps, CreateQnAFromQnAMakerFormData } from './constants';
import { knowledgeBaseStyle, subText, accountInfo, signInButton } from './styles';

const formConfig: FieldConfig<CreateQnAFromQnAMakerFormData> = {
  name: {
    required: true,
    defaultValue: '',
  },
};

export const CreateQnAFromQnAMaker: React.FC<CreateQnAFromFormProps> = (props) => {
  const { onChange, qnaFiles, initialName, onNext } = props;
  const [signedInAccount, setSignedInAccount] = useState('');

  formConfig.name.validate = validateName(qnaFiles);
  formConfig.name.defaultValue = initialName || '';
  const { formData, hasErrors } = useForm(formConfig);

  useEffect(() => {
    const disabled = hasErrors || !formData.name;
    onChange(formData, disabled);
  }, [formData]);

  const shouldProvideTokens = userShouldProvideTokens();
  if (!shouldProvideTokens) {
    AuthClient.getAccount().then((account) => {
      setSignedInAccount(account.loginName);
    });
  }

  return (
    <Fragment>
      <Stack>
        <Text styles={knowledgeBaseStyle}>
          {formatMessage('Import content from an existing KB on the QnA maker portal')}
        </Text>
        <p>
          <span css={subText}>
            {formatMessage(
              'Import content from an existing KB on the QnA maker portal. Your KB will downloaded locally and source KB will remain as-is.'
            )}
          </span>
        </p>
      </Stack>

      {!shouldProvideTokens &&
        (signedInAccount ? (
          <div style={accountInfo}>
            <span>{`Signed in as ${signedInAccount}. Click `}</span>
            <span style={signInButton} onClick={onNext}>
              {'next '}
            </span>
            <span>{'to select KBs'}</span>
          </div>
        ) : (
          <div style={signInButton} onClick={onNext}>
            {formatMessage('Sign in to Azure to continue')}
          </div>
        ))}
    </Fragment>
  );
};

export default CreateQnAFromQnAMaker;