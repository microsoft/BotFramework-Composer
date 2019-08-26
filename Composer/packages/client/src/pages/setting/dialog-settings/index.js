import React, { useContext } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { get } from 'lodash';
import jsonlint from 'jsonlint-webpack';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/theme/neat.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';
import './style.css';

import { StoreContext } from '../../../store';
import { SensitiveProperties } from '../../../constants';
import settingsStorage from '../../../utils/dialogSettingStorage';

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
  const { settings, botName } = state;
  const { updateDialogSetting } = actions;

  const updateFormData = (editor, data, value) => {
    try {
      const result = JSON.parse(value);
      for (const item of SensitiveProperties) {
        const localSettings = settingsStorage.get(botName);
        const value = get(result, item);
        settingsStorage.setField(localSettings, item, value);
      }
      try {
        updateDialogSetting(result);
      } catch (err) {
        console.error(err.message);
      }
    } catch (err) {
      //Do Nothing
    }
  };

  return botName ? (
    <CodeMirror value={JSON.stringify(settings, null, 2)} options={cmOptions} onChange={updateFormData} autoCursor />
  ) : (
    <div>Data loading ... </div>
  );
};
