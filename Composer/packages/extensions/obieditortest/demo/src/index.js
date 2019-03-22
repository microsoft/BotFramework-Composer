import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { Dropdown, DropdownMenuItemType } from 'office-ui-fabric-react/lib/Dropdown';

import { mergedSchema } from '../../src/schema/appschema';
import Example from '../../src';

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

function Demo() {
  const [editorData, setEditorData] = useState(JSON.stringify(defaultData, null, 2));
  const [memoryData, setMemoryData] = useState(JSON.stringify(defaultMemory, null, 2));

  const [formData, setFormData] = useState(defaultData);
  const [memoryFormData, setMemoryFormData] = useState(defaultMemory);

  const [isValid, setValid] = useState(true);
  const [isMemoryValid, setMemoryValid] = useState(true);

  const updateEditorData = (editor, data, value) => {
    try {
      const parsed = JSON.parse(value);
      setFormData(parsed);
      setValid(true);
    } catch (err) {
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

  useEffect(() => {
    setEditorData(JSON.stringify(formData, null, 2));
  }, [formData]);

  const dialogGroups = {
    'Input/Prompt Dialogs': [
      'Microsoft.TextPrompt',
      'Microsoft.DateTimePrompt',
      'Microsoft.FloatPrompt',
      'Microsoft.IntegerPrompt',
    ],
    'Dialog Steps': [
      'Microsoft.CallDialog',
      'Microsoft.GotoDialog',
      'Microsoft.EndDialog',
      'Microsoft.CancelDialog',
      'Microsoft.SendActivity',
      'Microsoft.IfProperty',
    ],
    Rules: [
      'Microsoft.BeginDialogRule',
      'Microsoft.EventRule',
      'Microsoft.IntentRule',
      'Microsoft.WelcomeRule',
      'Microsoft.DefaultRule',
    ],
    Recognizers: ['Microsoft.LuisRecognizer', 'Microsoft.RegexRecognizer'],
    Other: ['Microsoft.AdaptiveDialog'],
  };

  const buildDialogOptions = () => {
    const options = [];

    for (const elem in dialogGroups) {
      options.push({ key: elem, text: elem, itemType: DropdownMenuItemType.Header });
      dialogGroups[elem].forEach(dialog => {
        options.push({ key: dialog, text: dialog });
      });
      options.push({ key: 'divider_2', text: '-', itemType: DropdownMenuItemType.Divider });
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
          value={editorData}
          options={cmOptions}
          onBeforeChange={(editor, data, value) => {
            setEditorData(value);
          }}
          onChange={updateEditorData}
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
        <Example data={formData} memory={memoryFormData} onChange={setFormData} />
      </div>
    </div>
  );
}

render(<Demo />, document.querySelector('#demo'));
