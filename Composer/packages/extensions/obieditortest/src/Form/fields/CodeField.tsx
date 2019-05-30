import React, { useState } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { FieldProps } from '@bfdesigner/react-jsonschema-form';
import { Dropdown, IDropdownOption, MessageBar, MessageBarType } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/clike/clike';
import 'codemirror/lib/codemirror.css';

import './codemirror-fabric.scss';
import './styles.scss';
import { BaseField } from './BaseField';

const cmOptions = {
  theme: 'fabric',
  viewportMargin: Infinity,
  lineNumbers: true,
  lineWrapping: true,
  indentWithTabs: false,
  tabSize: 2,
  smartIndent: true,
  height: 'auto',
};

const modeOptions: IDropdownOption[] = [
  {
    text: 'C#',
    key: 'text/x-csharp',
  },
  {
    text: 'Javscript',
    key: 'javascript',
  },
];

export const CodeField: React.FC<FieldProps> = props => {
  const [mode, setMode] = useState('javascript');
  const [initialData] = useState(props.formData);

  return (
    <BaseField {...props} className="CodeField">
      <MessageBar messageBarType={MessageBarType.warning}>
        <strong>{formatMessage('Experimental:')}</strong>&nbsp;
        {formatMessage('The code step is experimental. It should be used cautiously.')}
      </MessageBar>

      <div className="CodeFieldModeSelector">
        <Dropdown
          label={formatMessage('Language')}
          options={modeOptions}
          selectedKey={mode}
          onChange={(e, item) => {
            if (item) {
              setMode(item.key as string);
            }
          }}
        />
      </div>
      <CodeMirror
        value={initialData}
        options={{ ...cmOptions, mode }}
        onChange={(editor, data, value) => {
          props.onChange(value);
        }}
        autoCursor={false}
      />
    </BaseField>
  );
};
