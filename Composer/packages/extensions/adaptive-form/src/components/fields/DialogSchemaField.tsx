// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { FieldProps, useShellApi } from '@bfc/extension';
import { NeutralColors } from '@uifabric/fluent-theme';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';

import { FieldLabel } from '../FieldLabel';

export const DialogSchemaField: React.FC<FieldProps<string>> = function SchemaField(props) {
  const {
    id,
    value = '',
    disabled,
    label,
    description,
    placeholder,
    readonly,
    transparentBorder,
    onFocus,
    onBlur,
    error,
    uiOptions,
    required,
  } = props;
  const { currentDialog, shellApi, formDialogFiles } = useShellApi();
  const { isFormDialog, formDialogType } = currentDialog.content;
  const formDialogFile = formDialogFiles.find(file => file.id === currentDialog.id);
  const [formDialogContent, setFormDialogContent] = useState<string | undefined>(
    formDialogFile && formDialogFile.content
  );
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (typeof onFocus === 'function') {
      e.stopPropagation();
      onFocus(id, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (typeof onBlur === 'function') {
      e.stopPropagation();
      onBlur(id, value);
    }
  };

  const handleChange = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    setFormDialogContent(newValue);
    formDialogFile && shellApi.updateFormDialogContent(formDialogFile.id, newValue || '');
  };

  return isFormDialog && formDialogType === 'sandwich' ? (
    <>
      <FieldLabel description={description} id={id} label={label} helpLink={uiOptions?.helpLink} required={required} />
      <TextField
        disabled={disabled}
        errorMessage={error}
        id={id}
        placeholder={placeholder}
        readOnly={readonly}
        styles={{
          ...(transparentBorder
            ? {
                fieldGroup: {
                  borderColor: error ? undefined : 'transparent',
                  transition: 'border-color 0.1s linear',
                  selectors: {
                    ':hover': {
                      borderColor: error ? undefined : NeutralColors.gray30,
                    },
                  },
                },
              }
            : {}),
          root: { width: '100%' },
          errorMessage: { display: 'none' },
        }}
        value={formDialogContent}
        multiline
        rows={6}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        ariaLabel={label || formatMessage('schema field')}
      />
    </>
  ) : (
    <React.Fragment />
  );
};
