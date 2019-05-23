import React, { useState, useEffect, useRef } from 'react';
import { render } from 'react-dom';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { PrimaryButton, DirectionalHint } from 'office-ui-fabric-react';
import debounce from 'lodash.debounce';
import nanoid from 'nanoid';

import Example from '../../src';
import { ShellApi } from '../../src/types';
import { buildDialogOptions } from '../../src/Form/utils';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/neat.css';

import './styles.scss';

const cmOptions = {
  theme: 'material',
  viewportMargin: Infinity,
  mode: {
    name: 'javascript',
    json: true,
    statementIndent: 2,
  },
  lineNumbers: true,
  lineWrapping: true,
  indentWithTabs: false,
  tabSize: 2,
  smartIndent: true,
};

const defaultData = {
  $type: 'Microsoft.TextInput',
};

const defaultMemory = {
  user: {
    name: 'Chris',
  },
  converation: {},
  dialog: {},
  turn: {},
};

const dialogFiles = [
  {
    name: 'MyCustomDialog1.dialog',
    relativePath: 'MyCustomDialog1.dialog',
    path: '/Some/Cool/Path/MyCustomDialog1.dialog',
  },
  {
    name: 'MyCustomDialog2.dialog',
    relativePath: 'MyCustomDialog2.dialog',
    path: '/Some/Cool/Path/MyCustomDialog2.dialog',
  },
  {
    name: 'MyCustomDialog3.dialog',
    relativePath: 'MyCustomDialog3.dialog',
    path: '/Some/Cool/Path/MyCustomDialog3.dialog',
  },
  {
    name: 'MyCustomDialog4.dialog',
    relativePath: 'MyCustomDialog4.dialog',
    path: '/Some/Cool/Path/MyCustomDialog4.dialog',
  },
];

function getDefaultData() {
  const storage = window.sessionStorage.getItem('formData');

  if (storage) {
    return JSON.parse(storage);
  }

  return defaultData;
}

function getDefaultMemory() {
  const storage = window.sessionStorage.getItem('memoryFormData');

  if (storage) {
    return JSON.parse(storage);
  }

  return defaultMemory;
}

const mockShellApi = ['getState', 'getData', 'getDialogs', 'saveData', 'navTo', 'navDown', 'focusTo'].reduce(
  (mock, api) => {
    mock[api] = (...args) =>
      new Promise(resolve => {
        console.info(`shellApi.${api} called with`, args);
        resolve();
      });
    return mock;
  },
  {}
);

const Demo: React.FC = () => {
  const [dirtyFormData, setDirtyFormData] = useState(null);
  const [memoryData, setMemoryData] = useState(JSON.stringify(getDefaultMemory(), null, 2));
  const [formData, setFormData] = useState(getDefaultData());
  const [memoryFormData, setMemoryFormData] = useState(getDefaultMemory());
  const [navPath, setNavPath] = useState(nanoid());
  const debouncedOnChange = useRef(debounce(setFormData, 200)).current;

  const [isValid, setValid] = useState(true);
  const [isMemoryValid, setMemoryValid] = useState(true);

  useEffect(() => {
    window.sessionStorage.setItem('formData', JSON.stringify(formData));
    window.sessionStorage.setItem('memoryFormData', JSON.stringify(memoryFormData));
  }, [formData, memoryFormData]);

  const updateFormData = (editor, data, value) => {
    try {
      const parsed = JSON.parse(value);
      setFormData(parsed);
      setDirtyFormData(null);
      setValid(true);
    } catch (err) {
      setDirtyFormData(value);
      setValid(false);
    }
  };

  const updateMemoryData = (editor, data, value) => {
    try {
      const parsed = JSON.parse(value);
      setMemoryFormData(parsed);
      setMemoryValid(true);
    } catch (err) {
      setMemoryValid(false);
    }
  };

  const handlePaste = updater => (_, e) => {
    e.preventDefault();

    const data = (e.clipboardData || (window as any).clipboardData).getData('Text');

    if (data) {
      try {
        const parsed = JSON.parse(data);
        updater(parsed);
      } catch (err) {
        // do nothing
      }
    }
  };

  return (
    <div className="DemoContainer">
      <div style={{ display: 'flex', flexDirection: 'column' }} className="DemoJSONContainer">
        <div style={{ fontSize: '20px', paddingLeft: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <div>Data</div>
          <PrimaryButton
            title="Dialog Types"
            menuProps={{
              items: buildDialogOptions({ onClick: (_, item) => setFormData(item.data) }),
              directionalHint: DirectionalHint.bottomAutoEdge,
            }}
          >
            Dialog Types
          </PrimaryButton>
        </div>
        <CodeMirror
          value={dirtyFormData || JSON.stringify(formData, null, 2)}
          options={cmOptions}
          onBeforeChange={updateFormData}
          onChange={updateFormData}
          autoCursor
          onPaste={handlePaste(setFormData)}
          className={isValid ? '' : 'CodeMirror--error'}
        />
        <div style={{ fontSize: '20px', paddingLeft: '10px' }}>Memory</div>
        <CodeMirror
          value={memoryData}
          options={cmOptions}
          onBeforeChange={(editor, data, value) => {
            setMemoryData(value);
          }}
          onChange={updateMemoryData}
          autoCursor
          onPaste={handlePaste(setMemoryData)}
          className={isMemoryValid ? '' : 'CodeMirror--error'}
        />
      </div>
      <div className="DemoForm">
        <Example
          navPath={navPath}
          focusPath={navPath}
          data={formData}
          dialogs={dialogFiles}
          memory={memoryFormData}
          onChange={debouncedOnChange}
          schemas={{ editor: {} }}
          shellApi={mockShellApi as ShellApi}
        />
      </div>
    </div>
  );
};

render(<Demo />, document.querySelector('#demo'));
