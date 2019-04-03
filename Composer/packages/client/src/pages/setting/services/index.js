import React, { useContext, useState, useEffect } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import jsonlint from 'jsonlint-webpack';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/theme/neat.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';

import './style.css';
import { Store } from './../../../store/index';

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

export const Services = () => {
  const { state, actions } = useContext(Store);
  const { botProjFile } = state;
  const { updateProjFile } = actions;

  const [value, setValue] = useState('');

  useEffect(() => {
    if (botProjFile.name && !value) {
      setValue(botProjFile.content);
    }
  }, [botProjFile]);

  const updateFormData = (editor, data, value) => {
    try {
      if (!botProjFile.name) return;
      updateProjFile({
        name: botProjFile.name,
        content: JSON.parse(value),
      });
    } catch (err) {
      //TODO
    }
  };

  return <CodeMirror value={JSON.stringify(value, null, 2)} options={cmOptions} onChange={updateFormData} autoCursor />;
};
