import React, { useState } from 'react';
import formatMessage from 'format-message';
import { FieldProps } from '@bfdesigner/react-jsonschema-form';
import { Dropdown, ResponsiveMode, IDropdownOption, Spinner, SpinnerSize } from 'office-ui-fabric-react';

import { BaseField } from '../BaseField';
import { LuFile } from '../../../types';

import ToggleEditor from './ToggleEditor';
import RegexEditor from './RegexEditor';
import InlineLuEditor from './InlineLuEditor';

import './styles.scss';

export const RecognizerField: React.FC<FieldProps<MicrosoftIRecognizer>> = props => {
  const { formData } = props;
  const [loading, setLoading] = useState(false);

  const {
    formContext: { luFiles, shellApi, dialogName },
    onChange,
  } = props;

  const isRegex = typeof formData === 'object' && formData.$type === 'Microsoft.RegexRecognizer';
  const selectedFile: LuFile | void = luFiles.find(f => f.id === dialogName);
  const isLuFileSelected = Boolean(
    selectedFile && typeof props.formData === 'string' && props.formData.startsWith(selectedFile.id)
  );

  const handleChange = (_, option?: IDropdownOption) => {
    if (option) {
      switch (option.key) {
        case 'none': {
          onChange(undefined);
          return;
        }
        case 'luis': {
          if (selectedFile) {
            onChange(`${dialogName}.lu`);
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
            createLuFile(dialogName).then(() => {
              setTimeout(() => {
                onChange(`${dialogName}.lu`);
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
      text: 'BF Language Understanding',
    },
    {
      key: 'regex',
      text: formatMessage('Regular Expression'),
    },
  ];

  const getSelectedType = () => {
    if (typeof props.formData === 'string') {
      return 'luis';
    }

    if (isRegex) {
      return 'regex';
    }

    return 'none';
  };

  const onRenderTitle = (options?: IDropdownOption[]) => {
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
    <BaseField {...props}>
      <Dropdown
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
            const updateLuFile = (newValue?: string) => {
              shellApi.updateLuFile({ id: selectedFile.id, content: newValue });
            };
            return <InlineLuEditor file={selectedFile} onSave={updateLuFile} />;
          }
          if (isRegex) {
            return <RegexEditor {...props} />;
          }
        }}
      </ToggleEditor>
    </BaseField>
  );
};
