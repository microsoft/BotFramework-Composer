import React, { useState, useEffect, useContext } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import jsonlint from 'jsonlint-webpack';
import { get, debounce } from 'lodash';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/theme/neat.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';

import './style.css';
import settingsStorage from './../../../utils/dialogSettingStorage';
import { StoreContext } from './../../../store';
import { SensitiveProperties } from './../../../constants';
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
  const { state, actions } = useContext(StoreContext);
  const { settings, botName, isEnvSettingUpdated } = state;
  const { setEnvSettings } = actions;
  useEffect(() => {
    setValue(settings);
  }, [botName, isEnvSettingUpdated]);

  const updateFormData = (editor, data, value) => {
    try {
      const result = JSON.parse(value);
      try {
        for (const property of SensitiveProperties) {
          const propertyValue = get(result, property);
          settingsStorage.setField(botName, property, propertyValue ? propertyValue : '');
        }
        setEnvSettings(result);
      } catch (err) {
        console.error(err.message);
      }
    } catch (err) {
      //Do Nothing
    }
  };

  return botName ? (
    <CodeMirror
      value={JSON.stringify(value, null, 2)}
      options={cmOptions}
      onChange={debounce(updateFormData, 500)}
      autoCursor
    />
  ) : (
    <div>Data Loading...</div>
  );
};
