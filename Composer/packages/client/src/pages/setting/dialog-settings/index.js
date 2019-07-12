import React, { useState, useEffect, useContext } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import jsonlint from 'jsonlint-webpack';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/theme/neat.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';

import './style.css';
import oauthStorage from './../../../utils/oauthStorage';
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

export const DialogSettings = () => {
  const [value, setValue] = useState('');
  const { actions } = useContext(Store);

  const { updateOAuth } = actions;

  useEffect(() => {
    setValue(oauthStorage.get());
  }, []);

  const updateFormData = (editor, data, value) => {
    try {
      const result = JSON.parse(value);
      try {
        oauthStorage.set(result);
        updateOAuth(result);
      } catch (err) {
        console.log(err.message);
      }
    } catch (err) {
      //Do Nothing
    }
  };

  return <CodeMirror value={JSON.stringify(value, null, 2)} options={cmOptions} onChange={updateFormData} autoCursor />;
};
