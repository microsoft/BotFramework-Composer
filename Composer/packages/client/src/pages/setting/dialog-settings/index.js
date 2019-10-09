import React, { useState, useContext } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import jsonlint from 'jsonlint-webpack';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/theme/neat.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';

import './style.css';

import { StoreContext } from './../../../store';

window.jsonlint = jsonlint;

const cmOptions = {
  theme: 'neat',
  mode: {
    name: 'javascript',
    json: true,
    statementIndent: 2,
  },
  lineWrapping: true,
  indentWithTabs: false,
  lint: true,
  tabSize: 2,
  smartIndent: true,
};

export const DialogSettings = () => {
  const { state, actions } = useContext(StoreContext);
  const { botName, settings } = state;
  const [value, setValue] = useState(JSON.stringify(settings, null, 2));
  const updateFormData = (editor, data, newValue) => {
    try {
      setValue(newValue);
      const result = JSON.parse(newValue);
      try {
        actions.setSettings(botName, result);
      } catch (err) {
        console.error(err.message);
      }
    } catch (err) {
      //Do Nothing
    }
  };

  return botName ? (
    <CodeMirror value={value} onBeforeChange={updateFormData} options={cmOptions} />
  ) : (
    <div>Data Loading...</div>
  );
};
