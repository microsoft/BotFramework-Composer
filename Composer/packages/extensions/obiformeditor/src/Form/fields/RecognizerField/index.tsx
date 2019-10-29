/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import React, { useState, ReactElement } from 'react';
import formatMessage from 'format-message';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { Dropdown, ResponsiveMode, IDropdownOption, Spinner, SpinnerSize } from 'office-ui-fabric-react';
import { MicrosoftIRecognizer, LuFile } from 'shared';

import { BaseField } from '../BaseField';

import ToggleEditor from './ToggleEditor';
import RegexEditor from './RegexEditor';
import InlineLuEditor from './InlineLuEditor';

import './styles.css';

export const RecognizerField: React.FC<FieldProps<MicrosoftIRecognizer>> = props => {
  const { formData } = props;
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    formContext: { luFiles, shellApi, currentDialog },
    onChange,
  } = props;

  const isRegex = typeof formData === 'object' && formData.$type === 'Microsoft.RegexRecognizer';
  const currentDialogId = currentDialog.id;
  const selectedFile: LuFile | void = luFiles.find(f => f.id === currentDialogId);
  const isLuFileSelected = Boolean(
    selectedFile && typeof props.formData === 'string' && props.formData.startsWith(selectedFile.id)
  );

  const handleChange = (_, option?: IDropdownOption): void => {
    if (option) {
      switch (option.key) {
        case 'none': {
          onChange(undefined);
          return;
        }
        case 'luis': {
          if (selectedFile) {
            onChange(`${currentDialogId}.lu`);
          } else {
            const { createLuFile } = shellApi;

            /**
             * The setTimeouts are used to get around the
             * 1. allows the store to update with the luFile creation
             * 2. allows the debounced onChange to be invoked
             *
             * This is a hack, but dialogs will be created along with
             * lu and lg files so this code path shouldn't be executed.
             */
            setLoading(true);
            createLuFile(currentDialogId).then(() => {
              setTimeout(() => {
                onChange(`${currentDialogId}.lu`);
                setTimeout(() => {
                  setLoading(false);
                }, 750);
              }, 500);
            });
          }
          return;
        }
        case 'regex': {
          onChange({ $type: 'Microsoft.RegexRecognizer' });
          return;
        }
        default:
          return;
      }
    }
  };
  const options = [
    {
      key: 'none',
      text: formatMessage('None'),
    },
    {
      key: 'luis',
      text: 'LUIS',
    },
    {
      key: 'regex',
      text: formatMessage('Regular Expression'),
    },
  ];

  const getSelectedType = (): string => {
    if (typeof props.formData === 'string') {
      return 'luis';
    }

    if (isRegex) {
      return 'regex';
    }

    return 'none';
  };

  const onRenderTitle = (options?: IDropdownOption[]): ReactElement => {
    if (loading || !options) {
      return (
        <div style={{ height: '100%', display: 'flex' }}>
          <Spinner size={SpinnerSize.small} />
        </div>
      );
    }

    const selectedOption = options.find(o => o.key === getSelectedType());

    if (selectedOption) {
      return <span>{selectedOption.text}</span>;
    }

    return <span />;
  };

  return (
    <div className="RecognizerField">
      <BaseField {...props}>
        <Dropdown
          styles={{ root: { paddingRight: '47px' } }}
          label={formatMessage('Recognizer Type')}
          onChange={handleChange}
          options={options}
          selectedKey={getSelectedType()}
          responsiveMode={ResponsiveMode.large}
          onRenderTitle={onRenderTitle}
        />
        <ToggleEditor
          key={getSelectedType()}
          title={isLuFileSelected ? 'text editor' : 'regular expression editor'}
          loaded={Boolean(!loading && formData)}
        >
          {() => {
            if (selectedFile && isLuFileSelected) {
              const updateLuFile = (newValue?: string): void => {
                shellApi
                  .updateLuFile({ id: selectedFile.id, content: newValue })
                  .then(() => setErrorMsg(''))
                  .catch(error => {
                    setErrorMsg(error);
                  });
              };

              return <InlineLuEditor file={selectedFile} onSave={updateLuFile} errorMsg={errorMsg} />;
            }
            if (isRegex) {
              return <RegexEditor {...props} />;
            }
          }}
        </ToggleEditor>
      </BaseField>
    </div>
  );
};
