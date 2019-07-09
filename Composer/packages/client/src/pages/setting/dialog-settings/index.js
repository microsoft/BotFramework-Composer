import React, { useState, useEffect } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import jsonlint from 'jsonlint-webpack';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/theme/neat.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';

import './style.css';

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
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue({
      OAuthInput: {
        MicrosoftAppId: '',
        MicrosoftAppPassword: '',
      },
    });
  }, []);

  const updateFormData = (editor, data, value) => {
    try {
      JSON.parse(value);
    } catch (err) {
      //TODO
    }
  };

  return <CodeMirror value={JSON.stringify(value, null, 2)} options={cmOptions} onChange={updateFormData} autoCursor />;
};
