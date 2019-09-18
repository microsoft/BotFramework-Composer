import React, { useEffect, useContext, useState, useRef } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
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
  const { state, actions } = useContext(StoreContext);
  const { botName, settings, isEnvSettingUpdated } = state;
  const { syncEnvSettings } = actions;
  const [value, setValue] = useState('');
  useEffect(() => {
    // need to refresh codemirror, if the value parse to string is the same as before, it will not refresh
    setValue(JSON.stringify(settings, null, 2));
  }, [botName, isEnvSettingUpdated]);

  const updateFormData = (editor, data, newValue) => {
    setValue(newValue);
    syncSettings(newValue);
  };

  const syncSettings = useRef(
    debounce(newValue => {
      try {
        const result = JSON.parse(newValue);
        try {
          for (const property of SensitiveProperties) {
            const propertyValue = get(result, property);
            settingsStorage.setField(botName, property, propertyValue ? propertyValue : '');
          }
          syncEnvSettings(result);
        } catch (err) {
          console.error(err.message);
        }
      } catch (err) {
        //Do Nothing
      }
    }, 500)
  ).current;

  //debounce(updateFormData, 500)
  return botName ? (
    <CodeMirror
      value={value}
      onBeforeChange={updateFormData}
      onChange={(editor, value) => {
        console.log('controlled', { value });
      }}
      options={cmOptions}
    />
  ) : (
    <div>Data Loading...</div>
  );
};
