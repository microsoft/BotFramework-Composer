// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, ReactElement, Suspense, useEffect } from 'react';
import formatMessage from 'format-message';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { MicrosoftIRecognizer } from '@bfc/shared';
import { LuFile, combineMessage } from '@bfc/indexers';

import { BaseField } from '../BaseField';
import { LoadingSpinner } from '../../../LoadingSpinner';

import ToggleEditor from './ToggleEditor';
import RegexEditor from './RegexEditor';

import './styles.css';

const InlineLuEditor = React.lazy(() => import('./InlineLuEditor'));

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

  //make the inline editor show error message
  useEffect(() => {
    if (selectedFile && selectedFile.diagnostics.length > 0) {
      const msg = combineMessage(selectedFile.diagnostics);
      setErrorMsg(msg);
    } else {
      setErrorMsg('');
    }
  }, [selectedFile]);

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
                shellApi.updateLuFile({ id: selectedFile.id, content: newValue }).catch(setErrorMsg);
              };

              return (
                <Suspense fallback={<LoadingSpinner />}>
                  <InlineLuEditor file={selectedFile} onSave={updateLuFile} errorMsg={errorMsg} />
                </Suspense>
              );
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
