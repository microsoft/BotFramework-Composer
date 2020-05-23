// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { FieldProps, useShellApi } from '@bfc/extension';
import { NeutralColors } from '@uifabric/fluent-theme';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { IDropdownOption, Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
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
  const { dialogType } = currentDialog.content;
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
    formDialogFile && shellApi.updateFormDialogContent(formDialogFile.id, newValue || '', dialogType);
  };

  const [apiList, setApiList] = useState<IDropdownOption[]>([]);
  const [gitScriptProperty, setGitScriptProperty] = useState<{ fileName?: string; apiName?: string; method?: string }>(
    {}
  );
  const methodList: IDropdownOption[] = [
    {
      key: 'get',
      text: 'Get',
    },
    {
      key: 'post',
      text: 'Post',
    },
    {
      key: 'put',
      text: 'Put',
    },
    {
      key: 'patch',
      text: 'Patch',
    },
    {
      key: 'delete',
      text: 'DELETE',
    },
  ];
  const getFileText = result => {
    const jsonData = JSON.parse(result);
    if (!jsonData || !jsonData.paths) {
      setApiList([]);
      return;
    }
    const apiListItems: IDropdownOption[] = [];
    Object.keys(jsonData.paths).forEach(key => {
      apiListItems.push({
        key: key,
        text: key,
      });
    });
    setApiList(apiListItems);
  };
  const handleFileSelect = e => {
    const files = e.target.files;
    if (!files.length) {
      return;
    }

    const file = files[0];
    setGitScriptProperty({ fileName: file.name });
    const reader = new FileReader();
    reader.onload = e => {
      getFileText(e.target?.result);
      shellApi.copyFile(`${currentDialog.id}.json`, (e.target?.result as string) || '');
    };
    reader.readAsText(file);
  };
  const updateScriptProperty = (field: string) => (e, newValue) => {
    const newData = {
      ...gitScriptProperty,
      [field]: typeof newValue === 'string' ? newValue : newValue?.key,
    };
    setGitScriptProperty(newData);
    const content = `C:/Users/julong/Documents/code/BotBuilder-Samples/experimental/generation/generator/bin/run dialog:generate:swagger ${currentDialog.id}.json -o . -r ${newData.apiName} -m ${newData.method} -p dialog.response -n  ${currentDialog.id}.schema  --verbose `;
    formDialogFile && shellApi.updateFormDialogContent(formDialogFile.id, content, dialogType);
  };

  const lableStyle = {
    backgroundColor: '#7F9CCB',
    padding: '5px 10px',
    borderRadius: '5px',
    border: '1px ridge black',
    font: '#7F9CCB',
    fontSize: '0.8rem',
    '&:hover': {
      backgroundColor: '#2D5BA3',
      color: 'white',
    },
  };
  return (
    <>
      {dialogType === 'formDialog' && (
        <>
          <FieldLabel
            description={description}
            id={id}
            label={label}
            helpLink={uiOptions?.helpLink}
            required={required}
          />
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
      )}
      {dialogType === 'swaggerDialog' && (
        <>
          <label htmlFor="file_selector" style={lableStyle}>
            {gitScriptProperty.fileName ? `File name: ${gitScriptProperty.fileName}` : 'Choose swagger api file'}
          </label>
          <input
            type="file"
            id="file_selector"
            name="file_selector"
            accept=".json"
            onChange={handleFileSelect}
            style={{ visibility: 'hidden' }}
          ></input>
          {apiList && apiList.length > 0 ? (
            <>
              <Dropdown
                label={formatMessage('choose api?')}
                options={apiList}
                onChange={updateScriptProperty('apiName')}
                data-testid={'apiListDropdown'}
                defaultSelectedKey={gitScriptProperty.apiName}
              />
              <Dropdown
                label={formatMessage('choose method?')}
                options={methodList}
                onChange={updateScriptProperty('method')}
                data-testid={'methodListDropdown'}
                defaultSelectedKey={gitScriptProperty.method}
              />
            </>
          ) : (
            <div>{gitScriptProperty.fileName ? 'Can not find api list in the file' : ''}</div>
          )}
        </>
      )}
    </>
  );
};
