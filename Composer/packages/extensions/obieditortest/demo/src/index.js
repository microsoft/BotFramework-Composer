import React, { useState } from 'react';
import { render } from 'react-dom';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { Dropdown, DropdownMenuItemType } from 'office-ui-fabric-react/lib/Dropdown';

import Example from '../../src';
import { dialogGroups } from '../../src/schema/appschema';

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
  $type: 'Microsoft.TextPrompt',
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
  },
  {
    name: 'MyCustomDialog2.dialog',
    relativePath: 'MyCustomDialog2.dialog',
  },
  {
    name: 'MyCustomDialog3.dialog',
    relativePath: 'MyCustomDialog3.dialog',
  },
  {
    name: 'MyCustomDialog4.dialog',
    relativePath: 'MyCustomDialog4.dialog',
  },
];

function Demo() {
  const [dirtyFormData, setDirtyFormData] = useState(null);
  const [memoryData, setMemoryData] = useState(JSON.stringify(defaultMemory, null, 2));
  const [formData, setFormData] = useState(defaultData);
  const [memoryFormData, setMemoryFormData] = useState(defaultMemory);

  const [isValid, setValid] = useState(true);
  const [isMemoryValid, setMemoryValid] = useState(true);

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

  const buildDialogOptions = () => {
    const options = [];

    for (const elem in dialogGroups) {
      options.push({ key: elem, text: elem, itemType: DropdownMenuItemType.Header });
      dialogGroups[elem].forEach(dialog => {
        options.push({ key: dialog, text: dialog });
      });
      options.push({ key: `${elem}_divider`, text: '-', itemType: DropdownMenuItemType.Divider });
    }

    return options;
  };

  const onDialogChange = (event, option) => {
    setFormData({ $type: option.text });
  };

  return (
    <div className="DemoContainer">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Dropdown
          style={{ width: '300px', paddingBottom: '10px', marginLeft: '10px', marginTop: '10px' }}
          placeholder="Dialog Types"
          options={buildDialogOptions()}
          onChange={onDialogChange}
          onFocus={() => {}}
          selectedKey={null}
        />
        <div style={{ fontSize: '20px', paddingLeft: '10px' }}>Data</div>
        <CodeMirror
          value={dirtyFormData || JSON.stringify(formData, null, 2)}
          options={cmOptions}
          onBeforeChange={updateFormData}
          onChange={updateFormData}
          autoCursor
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
          className={isMemoryValid ? '' : 'CodeMirror--error'}
        />
      </div>
      <div className="DemoForm">
        <Example data={formData} dialogs={dialogFiles} memory={memoryFormData} onChange={setFormData} />
      </div>
    </div>
  );
}

render(<Demo />, document.querySelector('#demo'));
