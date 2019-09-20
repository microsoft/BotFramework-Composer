import React, { useContext } from 'react';
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

  const updateFormData = (editor, data, newValue) => {
    if (botName) {
      syncSettings(newValue);
    }
  };

  const syncSettings = newValue => {
    try {
      const result = JSON.parse(newValue);
      try {
        actions.syncEnvSettings(botName, result);
      } catch (err) {
        console.error(err.message);
      }
    } catch (err) {
      //Do Nothing
    }
  };

  return botName && botName !== '' ? (
    <CodeMirror value={JSON.stringify(settings, null, 2)} onBeforeChange={updateFormData} options={cmOptions} />
  ) : (
    <div>Data Loading...</div>
  );
};
