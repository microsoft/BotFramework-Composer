import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { Controlled as CodeMirror } from 'react-codemirror2';

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
  $type: 'Microsoft.WelcomeRule',
  steps: [
    {
      $type: 'Microsoft.SendActivity',
      activity: 'Hi! I\'m a ToDo bot. Say "add a todo named first one" to get started.',
    },
  ],
};

function Demo() {
  const [editorData, setEditorData] = useState(JSON.stringify(defaultData, null, 2));
  const [formData, setFormData] = useState(defaultData);
  const [isValid, setValid] = useState(true);

  const updateEditorData = (editor, data, value) => {
    try {
      const parsed = JSON.parse(value);
      setFormData(parsed);
      setValid(true);
    } catch (err) {
      setValid(false);
    }
  };

  useEffect(() => {
    setEditorData(JSON.stringify(formData, null, 2));
  }, [formData]);

  return (
    <div className="DemoContainer">
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
      <div className="DemoForm">
        <Example data={formData} onChange={setFormData} />
      </div>
    </div>
  );
}

render(<Demo />, document.querySelector('#demo'));
